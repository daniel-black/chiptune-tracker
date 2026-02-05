import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";

export const playheadAtom = atom<number>(0); // by default, play from first row

const isRowPlayheadFamily = atomFamily((rowIndex: number) =>
  atom((get) => get(playheadAtom) === rowIndex),
);

export function useIsRowPlayhead(rowIndex: number) {
  return useAtomValue(isRowPlayheadFamily(rowIndex));
}
