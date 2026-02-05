import { rows } from "@/audio/constants";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";

type Range = { start: number; end: number };

const defaultRange: Range = { start: 0, end: 63 } as const;

export const playbackRangeAtom = atom<Range>(defaultRange);

export const resetPlaybackRangeAtom = atom(null, (get, set) => {
  const { start, end } = get(playbackRangeAtom);
  if (start !== defaultRange.start && end !== defaultRange.end) {
    set(playbackRangeAtom, { ...defaultRange });
  }
});

export const setStartOfPlaybackRangeAtom = atom(
  null,
  (get, set, start: number) => {
    const range = get(playbackRangeAtom);

    if (
      start >= 0 &&
      start < rows - 2 && // need at least one row for an end of range
      range.start !== start &&
      start < range.end
    ) {
      set(playbackRangeAtom, { start, end: range.end });
    }
  },
);

export const setEndOfPlaybackRangeAtom = atom(null, (get, set, end: number) => {
  const range = get(playbackRangeAtom);

  if (end > 0 && end < rows && range.end !== end && range.start < end) {
    set(playbackRangeAtom, { start: range.start, end });
  }
});

const canRowBeStartOfRangeFamily = atomFamily((rowIndex: number) =>
  atom((get) => {
    const range = get(playbackRangeAtom);
    return rowIndex !== range.start && rowIndex < range.end;
  }),
);

export function useCanRowBeStartOfRange(rowIndex: number) {
  return useAtomValue(canRowBeStartOfRangeFamily(rowIndex));
}

const canRowBeEndOfRangeFamily = atomFamily((rowIndex: number) =>
  atom((get) => {
    const range = get(playbackRangeAtom);
    return rowIndex !== range.end && rowIndex > range.start;
  }),
);

export function useCanRowBeEndOfRange(rowIndex: number) {
  return useAtomValue(canRowBeEndOfRangeFamily(rowIndex));
}

const isStartRowFamily = atomFamily((rowIndex: number) =>
  atom((get) => get(playbackRangeAtom).start === rowIndex),
);

const isEndRowFamily = atomFamily((rowIndex: number) =>
  atom((get) => get(playbackRangeAtom).end === rowIndex),
);

export function useIsStartRow(rowIndex: number) {
  return useAtomValue(isStartRowFamily(rowIndex));
}

export function useIsEndRow(rowIndex: number) {
  return useAtomValue(isEndRowFamily(rowIndex));
}
