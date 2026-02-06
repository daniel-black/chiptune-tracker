import { nowIso } from "@/utils/format";
import type {
  CellPosition,
  NoiseCell,
  PersistedSong,
  PulseCell,
  Row,
  Song,
} from "../types";
import { rows } from "./constants";

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

export function createDefaultRow(): Row {
  return [
    createDefaultPulseCell(),
    createDefaultPulseCell(),
    createDefaultPulseCell(),
    createDefaultNoiseCell(),
  ];
}

export function createDefaultSong(): Song {
  return Array.from({ length: rows }, createDefaultRow);
}

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

export function createNewPersistedSong(): PersistedSong {
  const now = nowIso();

  return {
    name: "",
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    pattern: createDefaultSong(), // rename this eventually
  };
}
