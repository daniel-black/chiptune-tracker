import { createNewPersistedSong } from "@/audio/utils";
import type { PersistedSong } from "@/types";
import { atom, useSetAtom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const songStorage = createJSONStorage<PersistedSong>(() => localStorage);

export const songAtomFamily = (uuid: string) =>
  atomWithStorage<PersistedSong>(
    `song:${uuid}`,
    createNewPersistedSong(),
    songStorage,
  );

const createNewSongAtom = atom(null, (_, set, uuid: string) => {
  set(songAtomFamily(uuid), createNewPersistedSong());
});

export function useCreateNewSong() {
  return useSetAtom(createNewSongAtom);
}
