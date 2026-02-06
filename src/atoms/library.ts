import { createNewPersistedSong } from "@/audio/utils";
import type { PersistedSong } from "@/types";
import { atom, useSetAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const songStorage = createJSONStorage<PersistedSong>(() => localStorage);
const indexStorage = createJSONStorage<string[]>(() => localStorage);

/** Memoized atom family — same uuid always returns the same atom instance. */
export const songAtomFamily = atomFamily((uuid: string) =>
  atomWithStorage<PersistedSong>(
    `song:${uuid}`,
    createNewPersistedSong(uuid),
    songStorage,
    { getOnInit: true },
  ),
);

/** Tracks which song UUIDs exist so the home page can list them. */
export const songIndexAtom = atomWithStorage<string[]>(
  "songIndex",
  [],
  indexStorage,
);

const createNewSongAtom = atom(null, (get, set, uuid: string) => {
  set(songAtomFamily(uuid), createNewPersistedSong(uuid));
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
  // Remove from localStorage
  localStorage.removeItem(`song:${uuid}`);
  // Remove from atom family cache
  songAtomFamily.remove(uuid);
});

export function useDeleteSong() {
  return useSetAtom(deleteSongAtom);
}
