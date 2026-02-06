import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { patternAtom } from "@/atoms/pattern";
import { cellKey, parseCellKey } from "../utils";
import type { PulseCell } from "@/models/pulse-cell";
import type { Row } from "@/models/song";
import type { NoiseCell } from "@/models/noise-cell";

type SetStateAction<T> = T | ((prev: T) => T);

export const pulseCellAtomFamily = atomFamily((key: string) =>
  atom(
    (get) => {
      const { rowIndex, columnIndex } = parseCellKey(key);
      if (columnIndex === 3) {
        throw new Error(
          "pulseCellAtomFamily cannot be used for column 3 (noise column)",
        );
      }
      return get(patternAtom)[rowIndex][columnIndex] as PulseCell;
    },
    (get, set, action: SetStateAction<PulseCell>) => {
      const { rowIndex, columnIndex } = parseCellKey(key);

      const pattern = get(patternAtom);
      const prevCell = pattern[rowIndex][columnIndex] as PulseCell;
      const nextCell = typeof action === "function" ? action(prevCell) : action;

      const nextPattern = pattern.slice();
      const nextRow = nextPattern[rowIndex].slice();
      nextRow[columnIndex] = nextCell;
      nextPattern[rowIndex] = nextRow as Row;

      set(patternAtom, nextPattern);
    },
  ),
);

export function usePulseCell(rowIndex: number, columnIndex: number) {
  const [pulseCell, setPulseCell] = useAtom(
    pulseCellAtomFamily(cellKey(rowIndex, columnIndex)),
  );

  function setNote(note: PulseCell["note"]) {
    setPulseCell({ ...pulseCell, note });
  }

  function setDuty(duty: PulseCell["duty"]) {
    setPulseCell({ ...pulseCell, duty });
  }

  function setVolume(volume: PulseCell["volume"]) {
    setPulseCell({ ...pulseCell, volume });
  }

  return { pulseCell, setNote, setDuty, setVolume } as const;
}

// For column 3 only - returns NoiseCell
export const noiseCellAtomFamily = atomFamily((key: string) =>
  atom(
    (get) => {
      const { rowIndex, columnIndex } = parseCellKey(key);
      if (columnIndex !== 3) {
        throw new Error("noiseCellAtomFamily can only be used for column 3");
      }
      return get(patternAtom)[rowIndex][columnIndex] as NoiseCell;
    },
    (get, set, action: SetStateAction<NoiseCell>) => {
      const { rowIndex, columnIndex } = parseCellKey(key);

      const pattern = get(patternAtom);
      const prevCell = pattern[rowIndex][columnIndex] as NoiseCell;
      const nextCell = typeof action === "function" ? action(prevCell) : action;

      const nextPattern = pattern.slice();
      const nextRow = nextPattern[rowIndex].slice();
      nextRow[columnIndex] = nextCell;
      nextPattern[rowIndex] = nextRow as Row;

      set(patternAtom, nextPattern);
    },
  ),
);

export function useNoiseCell(rowIndex: number, columnIndex: number) {
  const [noiseCell, setNoiseCell] = useAtom(
    noiseCellAtomFamily(cellKey(rowIndex, columnIndex)),
  );

  function setRate(rate: NoiseCell["rate"]) {
    setNoiseCell({ ...noiseCell, rate });
  }

  function setVolume(volume: NoiseCell["volume"]) {
    setNoiseCell({ ...noiseCell, volume });
  }

  return { noiseCell, setRate, setVolume } as const;
}
