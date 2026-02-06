import type { Duty, DutyValue } from "./audio/duty";
import type { MusicalNote } from "./audio/notes";
import type { Rate } from "./audio/rate";
import type { VolumeLevel } from "./audio/volume";

export type PulseCell = {
  kind: "pulse";
  note: MusicalNote | "OFF" | "---";
  duty: Duty | "--";
  volume: VolumeLevel | "--";
};

export type SynthesizedPulseCell = {
  kind: "pulse";
  frequency: number;
  duty: DutyValue;
  gain: number;
};

export type NoiseCell = {
  kind: "noise";
  rate: Rate | "--";
  volume: VolumeLevel | "--";
};

export type SynthesizedNoiseCell = {
  kind: "noise";
  rate: number;
  gain: number;
};

export type Cell = PulseCell | NoiseCell;

export type Row = [PulseCell, PulseCell, PulseCell, NoiseCell];

export type SynthesizedRow = [
  SynthesizedPulseCell,
  SynthesizedPulseCell,
  SynthesizedPulseCell,
  SynthesizedNoiseCell,
];

export type Song = Array<Row>; // 64 rows

export type CellPosition = { rowIndex: number; columnIndex: number };

export type PersistedSong = {
  name: string;
  id: string;
  createdAt: string;
  updatedAt: string;
  pattern: Array<Row>;
};
