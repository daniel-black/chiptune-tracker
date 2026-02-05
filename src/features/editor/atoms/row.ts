import { rows } from "@/audio/constants";
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

    // transparent if whole range selected and playback is stopped
    if (range.start === 0 && range.end === rows - 1 && !showPlayhead) {
      return "bg-transparent hover:bg-background/50";
    }

    const playhead = get(playheadAtom);

    if (rowIndex === playhead && showPlayhead) {
      return "bg-primary/80 hover:bg-primary/90";
    }

    return "bg-primary/50 hover:bg-primary/60";
  }),
);

export function useRowStyle(rowIndex: number) {
  return useAtomValue(rowStyleAtomFamily(rowIndex));
}
