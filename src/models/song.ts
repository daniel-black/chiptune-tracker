import type { PulseCell } from "./pulse-cell";
import type { NoiseCell } from "./noise-cell";

export type Cell = PulseCell | NoiseCell;
export type Row = Array<Cell>;
export type Pattern = Array<Row>;

export type NamedPattern = {
  id: string;
  name: string;
  data: Pattern;
};

export type Song = {
  name: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  patterns: Record<string, NamedPattern>;
  patternOrder: Array<string>;
};
