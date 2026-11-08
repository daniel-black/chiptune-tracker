import { defaultRange } from "@/audio/constants";
import { playbackRangeAtom } from "@/features/playback/atoms/range";
import { atom, useAtomValue } from "jotai";
import { atomFamily } from "jotai-family";

// Every 4th row is a beat; the lift is subtle but enough to read rhythm at a glance
const beatRow = "bg-foreground/[0.045]";
const plainRow = "bg-transparent";

const rowStyleAtomFamily = atomFamily((rowIndex: number) =>
  atom((get) => {
    const range = get(playbackRangeAtom);
    const isBeat = rowIndex % 4 === 0;
    const base = isBeat ? beatRow : plainRow;

    // Dim rows outside a custom playback range
    if (rowIndex < range.start || rowIndex > range.end) {
      return `${base} opacity-45`;
    }

    // no range highlight when the whole pattern is selected
    if (range.start === defaultRange.start && range.end === defaultRange.end) {
      return base;
    }

    return isBeat ? "bg-primary/[0.14]" : "bg-primary/[0.08]";
  }),
);

export function useRowStyle(rowIndex: number) {
  return useAtomValue(rowStyleAtomFamily(rowIndex));
}
