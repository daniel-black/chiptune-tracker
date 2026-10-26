import { atom, useAtomValue } from "jotai";

/** Index into patternOrder tracking where in the sequence playback is. */
export const sequencePositionAtom = atom<number>(0);

export function useSequencePosition() {
  return useAtomValue(sequencePositionAtom);
}
