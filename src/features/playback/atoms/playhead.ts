import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";

export const playheadAtom = atom<number>(0); // by default, play from first row

export const isRowActiveFamily = atomFamily((rowIndex: number) =>
  atom((get) => get(playheadAtom) === rowIndex),
);

export function useIsRowPlaying(rowIndex: number) {
  return useAtomValue(isRowActiveFamily(rowIndex));
}
