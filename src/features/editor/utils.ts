import { rows } from "@/audio/constants";
import type { CellPosition } from "@/types";

export const cellKey = (rowIndex: number, columnIndex: number) =>
  `${rowIndex}:${columnIndex}` as const;

export function parseCellKey(cellKey: string): CellPosition {
  const [r, c] = cellKey.split(":");
  const row = Number(r);
  const col = Number(c);

  if (!Number.isInteger(row) || row < 0 || row >= rows) {
    throw new Error(`Invalid row in cell key: "${cellKey}"`);
  }
  if (![0, 1, 2, 3].includes(col)) {
    throw new Error(`Invalid col in cell key: "${cellKey}"`);
  }
  return { rowIndex: row, columnIndex: col };
}
