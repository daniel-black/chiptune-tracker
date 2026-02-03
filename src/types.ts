export type Duty = 0.125 | 0.25 | 0.5 | 0.75;

export type PulseCell = {
  kind: "pulse";
  note: string;
  duty: Duty;
  volume: number;
};

export type NoiseCell = {
  kind: "noise";
  rate: string;
  volume: number;
};

export type Cell = PulseCell | NoiseCell;

export type Row = [PulseCell, PulseCell, PulseCell, NoiseCell];

export type Song = Array<Row>; // 32 rows
