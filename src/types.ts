import type { Duty } from "./audio/duty";
import type { MusicalNote } from "./audio/notes";
import type { Rate } from "./audio/rate";
import type { VolumeLevel } from "./audio/volume";

export type PulseCell = {
  kind: "pulse";
  note: MusicalNote | "OFF" | "---";
  duty: Duty | "--";
  volume: VolumeLevel | "--";
};

export type NoiseCell = {
  kind: "noise";
  rate: Rate | "--";
  volume: VolumeLevel | "--";
};

export type Cell = PulseCell | NoiseCell;

export type Row = [PulseCell, PulseCell, PulseCell, NoiseCell];

export type Song = Array<Row>; // 32 rows

export type CellPosition = { rowIndex: number; columnIndex: number };
