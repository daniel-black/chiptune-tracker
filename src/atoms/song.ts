import { atomFamily } from "jotai-family";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { type Song } from "@/models/song";
import { createNewSong } from "@/models/factory";
import { nowIso } from "@/utils/format";
import { resetPlaybackRangeAtom } from "@/features/playback/atoms/range";
import { stopPlaybackAtom } from "@/features/playback/atoms/playback";
import { playheadAtom } from "@/features/playback/atoms/playhead";

const songStorage = createJSONStorage<Song>(() => localStorage);
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

export const setCurrentSongIdAtom = atom(
  null,
  (get, set, uuid: string | null) => {
    if (get(currentSongIdAtom) !== uuid) {
      set(currentSongIdAtom, uuid);
      set(stopPlaybackAtom);
      set(resetPlaybackRangeAtom);
      set(playheadAtom, 0);
    }
  },
);

export function useSetCurrentSongIdAtom() {
  return useSetAtom(setCurrentSongIdAtom);
}

export function useCurrentSongId() {
  return useAtomValue(currentSongIdAtom);
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
