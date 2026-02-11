import { atom, useAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { patternAtom } from "@/atoms/pattern";
import { cellKey, parseCellKey } from "../utils";
import type { PulseCell } from "@/models/pulse-cell";
import type { Cell, Row } from "@/models/song";
import type { NoiseCell } from "@/models/noise-cell";

type SetStateAction<T> = T | ((prev: T) => T);

export const cellAtomFamily = atomFamily((key: string) =>
  atom(
    (get) => {
      const { rowIndex, columnIndex } = parseCellKey(key);
      return get(patternAtom)[rowIndex][columnIndex];
    },
    (get, set, action: SetStateAction<Cell>) => {
      const { rowIndex, columnIndex } = parseCellKey(key);

      const pattern = get(patternAtom);
      const prevCell = pattern[rowIndex][columnIndex];
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
  const [cell, setCell] = useAtom(
    cellAtomFamily(cellKey(rowIndex, columnIndex)),
  );
  const pulseCell = cell as PulseCell;

  function setNote(note: PulseCell["note"]) {
    setCell({ ...pulseCell, note });
  }

  function setDuty(duty: PulseCell["duty"]) {
    setCell({ ...pulseCell, duty });
  }

  function setVolume(volume: PulseCell["volume"]) {
    setCell({ ...pulseCell, volume });
  }

  return { pulseCell, setNote, setDuty, setVolume } as const;
}

export function useNoiseCell(rowIndex: number, columnIndex: number) {
  const [cell, setCell] = useAtom(
    cellAtomFamily(cellKey(rowIndex, columnIndex)),
  );
  const noiseCell = cell as NoiseCell;

  function setRate(rate: NoiseCell["rate"]) {
    setCell({ ...noiseCell, rate });
  }

  function setVolume(volume: NoiseCell["volume"]) {
    setCell({ ...noiseCell, volume });
  }

  return { noiseCell, setRate, setVolume } as const;
}
