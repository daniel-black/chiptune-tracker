import type { CellPosition, NoiseCell, PulseCell, Song } from "../types";

export function createDefaultPulseCell(): PulseCell {
  return {
    kind: "pulse",
    note: "---",
    volume: "--",
    duty: "--",
  };
}

export function createDefaultNoiseCell(): NoiseCell {
  return {
    kind: "noise",
    rate: "--",
    volume: "--",
  };
}

export function createDefaultSong(): Song {
  return Array.from({ length: 64 }, () => [
    createDefaultPulseCell(),
    createDefaultPulseCell(),
    createDefaultPulseCell(),
    createDefaultNoiseCell(),
  ]);
}

export const cellKey = (rowIndex: number, columnIndex: number) =>
  `${rowIndex}:${columnIndex}` as const;

export function parseCellKey(cellKey: string): CellPosition {
  const [r, c] = cellKey.split(":");
  const row = Number(r);
  const col = Number(c);

  if (!Number.isInteger(row) || row < 0 || row >= 64) {
    throw new Error(`Invalid row in cell key: "${cellKey}"`);
  }
  if (![0, 1, 2, 3].includes(col)) {
    throw new Error(`Invalid col in cell key: "${cellKey}"`);
  }
  return { rowIndex: row, columnIndex: col };
}
