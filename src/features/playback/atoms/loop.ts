import { atom, useAtom } from "jotai";

// atom that holds state of whether or not playback should loop
export const loopAtom = atom(false);

export function useLoop() {
  return useAtom(loopAtom);
}
