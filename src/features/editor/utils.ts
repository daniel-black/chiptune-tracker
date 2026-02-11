import { rows } from "@/audio/constants";
import { CHANNEL_COUNT } from "@/audio/channel-config";

type CellPosition = { rowIndex: number; columnIndex: number };

export const cellKey = (rowIndex: number, columnIndex: number) =>
  `${rowIndex}:${columnIndex}` as const;

export function parseCellKey(cellKey: string): CellPosition {
  const [r, c] = cellKey.split(":");
  const row = Number(r);
  const col = Number(c);

  if (!Number.isInteger(row) || row < 0 || row >= rows) {
    throw new Error(`Invalid row in cell key: "${cellKey}"`);
  }
  if (!Number.isInteger(col) || col < 0 || col >= CHANNEL_COUNT) {
    throw new Error(`Invalid col in cell key: "${cellKey}"`);
  }
  return { rowIndex: row, columnIndex: col };
}
