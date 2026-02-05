import { rows } from "@/audio/constants";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { playheadAtom } from "./playhead";

type Range = { start: number; end: number };

const defaultRange: Range = { start: 0, end: 63 } as const;

export const playbackRangeAtom = atom<Range>(defaultRange);

export const isDefaultRangeSelectedAtom = atom((get) => {
  const { start, end } = get(playbackRangeAtom);

  return start === 0 && end === rows - 1;
});

const isInPlaybackRangeAtomFamily = atomFamily((rowIndex: number) =>
  atom((get) => {
    const { start, end } = get(playbackRangeAtom);
    return start <= rowIndex && rowIndex <= end;
  }),
);

export function useIsRowInPlaybackRange(rowIndex: number) {
  return useAtomValue(isInPlaybackRangeAtomFamily(rowIndex));
}

const resetPlaybackRangeAtom = atom(null, (get, set) => {
  const range = get(playbackRangeAtom);
  if (range.start !== 0 || range.end !== rows - 1) {
    set(playbackRangeAtom, defaultRange);
  }
});

export function useResetPlaybackRange() {
  const reset = useSetAtom(resetPlaybackRangeAtom);
  const isDefaultRangeSelected = useAtomValue(isDefaultRangeSelectedAtom);

  return { canReset: !isDefaultRangeSelected, reset } as const;
}

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

      // if playhead is before start, move it to start
      if (get(playheadAtom) < start) {
        set(playheadAtom, start);
      }
    }
  },
);

export const setEndOfPlaybackRangeAtom = atom(null, (get, set, end: number) => {
  const range = get(playbackRangeAtom);

  if (end > 0 && end < rows && range.end !== end && range.start < end) {
    set(playbackRangeAtom, { start: range.start, end });

    if (get(playheadAtom) > end) {
      set(playheadAtom, end);
    }
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
