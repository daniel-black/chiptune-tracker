import type { PulseCell } from "./pulse-cell";
import type { NoiseCell } from "./noise-cell";

export type Cell = PulseCell | NoiseCell;
export type Row = Array<Cell>;
export type Pattern = Array<Row>;

export type Song = {
  name: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  pattern: Pattern;
};
