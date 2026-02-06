import { defaultRange } from "@/audio/constants";
import { canStopPlaybackAtom } from "@/features/playback/atoms/playback";
import { playheadAtom } from "@/features/playback/atoms/playhead";
import { playbackRangeAtom } from "@/features/playback/atoms/range";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";

const rowStyleAtomFamily = atomFamily((rowIndex: number) =>
  atom((get) => {
    const range = get(playbackRangeAtom);

    // transparent if out of range
    if (rowIndex < range.start || rowIndex > range.end) {
      return "bg-transparent hover:bg-background/50";
    }

    const showPlayhead = get(canStopPlaybackAtom);
    const playhead = get(playheadAtom);

    if (rowIndex === playhead && showPlayhead) {
      return "bg-primary/80 hover:bg-primary/90";
    }

    // no range highlight when the whole pattern is selected
    if (range.start === defaultRange.start && range.end === defaultRange.end) {
      return "bg-transparent hover:bg-background/50";
    }

    return "bg-primary/50 hover:bg-primary/60";
  }),
);

export function useRowStyle(rowIndex: number) {
  return useAtomValue(rowStyleAtomFamily(rowIndex));
}
