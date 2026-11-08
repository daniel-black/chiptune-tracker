import { atomFamily } from "jotai-family";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { type Song } from "@/models/song";
import { createNewSong } from "@/models/factory";
import { nowIso } from "@/utils/format";
import { defaultBpm } from "@/audio/constants";
import { demoSongs } from "@/seed-default-song";
import { track, trackOnce } from "@/lib/analytics";
import type { SharedSong } from "@/lib/share";
import { resetPlaybackRangeAtom } from "@/features/playback/atoms/range";
import { stopPlaybackAtom } from "@/features/playback/atoms/playback";
import { playheadAtom } from "@/features/playback/atoms/playhead";

const baseSongStorage = createJSONStorage<Song>(() => localStorage);

/**
 * Bring songs saved by older versions up to the current shape:
 * - `pattern` (single) became `patterns` + `patternOrder`
 * - `bpm` moved from a global setting into each song
 */
function migrateLegacySong(key: string): void {
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!("bpm" in parsed)) {
      parsed.bpm = defaultBpm;
      localStorage.setItem(key, JSON.stringify(parsed));
    }
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
        bpm: parsed.bpm,
      };
      localStorage.setItem(key, JSON.stringify(migrated));
    }
  } catch {
    // If parsing fails, let the base storage handle it
  }
}

/**
 * A failed write (storage full, or blocked by the browser) means work isn't
 * being saved. Report it once and keep the app running on in-memory state
 * rather than throwing out of every edit.
 */
function reportWriteErrors<T>(
  storage: ReturnType<typeof createJSONStorage<T>>,
): typeof storage {
  return {
    ...storage,
    setItem(key, value) {
      try {
        storage.setItem(key, value);
      } catch (err) {
        console.error(`Couldn't save ${key}`, err);
        trackOnce("storage-error", {
          op: "write",
          reason: err instanceof DOMException ? err.name : "unknown",
        });
      }
    },
  };
}

const songStorage = reportWriteErrors<Song>({
  ...baseSongStorage,
  getItem(key, initialValue) {
    migrateLegacySong(key);
    return baseSongStorage.getItem(key, initialValue);
  },
});

const indexStorage = reportWriteErrors(
  createJSONStorage<string[]>(() => localStorage),
);

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
  { getOnInit: true },
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

/**
 * Apply a change to the current song and bump updatedAt. The updater returns the
 * fields to merge, or null to leave the song untouched.
 */
export const updateCurrentSongAtom = atom(
  null,
  (get, set, updater: (song: Song) => Partial<Song> | null) => {
    const songId = get(currentSongIdAtom);
    if (!songId) return;

    const song = get(songAtomFamily(songId));
    const changes = updater(song);
    if (!changes) return;

    set(songAtomFamily(songId), { ...song, ...changes, updatedAt: nowIso() });
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
  track("song-created");
  set(songAtomFamily(uuid), createNewSong(uuid));
  const index = get(songIndexAtom);
  if (!index.includes(uuid)) {
    set(songIndexAtom, [...index, uuid]);
  }
});

export function useCreateNewSong() {
  return useSetAtom(createNewSongAtom);
}

/** Save a song from a share link as a new song owned by this browser */
const importSharedSongAtom = atom(
  null,
  (get, set, shared: SharedSong): string => {
    const uuid = crypto.randomUUID();
    const now = nowIso();
    set(songAtomFamily(uuid), {
      ...shared,
      source: "shared",
      id: uuid,
      createdAt: now,
      updatedAt: now,
    });
    set(songIndexAtom, [...get(songIndexAtom), uuid]);
    return uuid;
  },
);

export function useImportSharedSong() {
  return useSetAtom(importSharedSongAtom);
}

export type DemoStatus = "missing" | "modified" | "original";

const songContent = (s: Song) =>
  JSON.stringify([s.name, s.bpm, s.patternOrder, s.patterns]);

/** Whether each demo song is missing or differs from how it shipped */
export const demoStatusesAtom = atom((get) => {
  const index = get(songIndexAtom);
  return demoSongs.map((demo) => {
    let status: DemoStatus = "missing";
    if (index.includes(demo.id)) {
      const song = get(songAtomFamily(demo.id));
      status = songContent(song) === songContent(demo) ? "original" : "modified";
    }
    return { demo, status };
  });
});

/** Put a demo song back as it shipped, re-adding it if it was deleted */
const restoreDemoSongAtom = atom(null, (get, set, demoId: string) => {
  const demo = demoSongs.find((d) => d.id === demoId);
  if (!demo) return;

  const status = get(demoStatusesAtom).find((d) => d.demo.id === demoId)?.status;
  track("demo-restored", { demo: demo.name, status: status ?? "unknown" });

  set(songAtomFamily(demo.id), {
    ...structuredClone(demo),
    updatedAt: nowIso(),
  });
  const index = get(songIndexAtom);
  if (!index.includes(demo.id)) {
    set(songIndexAtom, [...index, demo.id]);
  }
});

export function useRestoreDemoSong() {
  return useSetAtom(restoreDemoSongAtom);
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
  (_get, set, name: string) => {
    set(updateCurrentSongAtom, () => ({ name }));
  },
);

export function useSongName() {
  return useAtom(songNameAtom);
}
