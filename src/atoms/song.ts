import { atomFamily } from "jotai-family";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { type Song } from "@/models/song";
import { createNewSong } from "@/models/factory";
import { nowIso } from "@/utils/format";
import { resetPlaybackRangeAtom } from "@/features/playback/atoms/range";
import { stopPlaybackAtom } from "@/features/playback/atoms/playback";
import { playheadAtom } from "@/features/playback/atoms/playhead";

const baseSongStorage = createJSONStorage<Song>(() => localStorage);

/** Migrate legacy songs that have `pattern` instead of `patterns`. */
function migrateLegacySong(key: string): void {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if ("pattern" in parsed && !("patterns" in parsed)) {
      const patternId = crypto.randomUUID();
      const migrated = {
        name: parsed.name,
        id: parsed.id,
        createdAt: parsed.createdAt,
        updatedAt: parsed.updatedAt,
        patterns: {
          [patternId]: {
            id: patternId,
            name: "Pattern 1",
            data: parsed.pattern,
          },
        },
        patternOrder: [patternId],
      };
      localStorage.setItem(key, JSON.stringify(migrated));
    }
  } catch {
    // If parsing fails, let the base storage handle it
  }
}

const songStorage: typeof baseSongStorage = {
  ...baseSongStorage,
  getItem(key, initialValue) {
    migrateLegacySong(key);
    return baseSongStorage.getItem(key, initialValue);
  },
};

const indexStorage = createJSONStorage<string[]>(() => localStorage);

/** Memoized atom family — same uuid always returns the same atom instance. */
export const songAtomFamily = atomFamily((uuid: string) =>
  atomWithStorage<Song>(`song:${uuid}`, createNewSong(uuid), songStorage, {
    getOnInit: true,
  }),
);

/** Index in localStorage for keeping track of existing songs */
export const songIndexAtom = atomWithStorage<string[]>(
  "songIndex",
  [],
  indexStorage,
);

/** UUID of the song currently open in the editor. Null if not on editor page */
export const currentSongIdAtom = atom<string | null>(null);

/** ID of the pattern currently displayed in the editor */
export const currentPatternIdAtom = atom<string | null>(null);

export const setCurrentSongIdAtom = atom(
  null,
  (get, set, uuid: string | null) => {
    if (get(currentSongIdAtom) !== uuid) {
      set(currentSongIdAtom, uuid);
      set(stopPlaybackAtom);
      set(resetPlaybackRangeAtom);
      set(playheadAtom, 0);

      if (uuid) {
        const song = get(songAtomFamily(uuid));
        set(currentPatternIdAtom, song.patternOrder[0] ?? null);
      } else {
        set(currentPatternIdAtom, null);
      }
    }
  },
);

export function useSetCurrentSongIdAtom() {
  return useSetAtom(setCurrentSongIdAtom);
}

export function useCurrentSongId() {
  return useAtomValue(currentSongIdAtom);
}

export function useCurrentPatternId() {
  return useAtomValue(currentPatternIdAtom);
}

/** Atom for creating a new, persisted song and adding it to the index */
const createNewSongAtom = atom(null, (get, set, uuid: string) => {
  set(songAtomFamily(uuid), createNewSong(uuid));
  const index = get(songIndexAtom);
  if (!index.includes(uuid)) {
    set(songIndexAtom, [...index, uuid]);
  }
});

export function useCreateNewSong() {
  return useSetAtom(createNewSongAtom);
}

const deleteSongAtom = atom(null, (get, set, uuid: string) => {
  // Remove from index
  const index = get(songIndexAtom);
  set(
    songIndexAtom,
    index.filter((id) => id !== uuid),
  );

  localStorage.removeItem(`song:${uuid}`);
  songAtomFamily.remove(uuid);
});

export function useDeleteSong() {
  return useSetAtom(deleteSongAtom);
}

const songNameAtom = atom(
  (get): string => {
    const id = get(currentSongIdAtom);
    if (!id) {
      return "";
    }

    return get(songAtomFamily(id)).name;
  },
  (get, set, name: string) => {
    const id = get(currentSongIdAtom);
    if (!id) {
      return;
    }

    const prev = get(songAtomFamily(id));
    set(songAtomFamily(id), {
      ...prev,
      name,
      updatedAt: nowIso(),
    });
  },
);

export function useSongName() {
  return useAtom(songNameAtom);
}
