import { getNoteFrequency } from "./characteristics/notes";
import { getDutyValue, type DutyValue } from "./characteristics/duty";
import { getVolume } from "./characteristics/volume";
import { getRateValue } from "./characteristics/rate";
import type { PulseCell } from "@/models/pulse-cell";
import type { NoiseCell } from "@/models/noise-cell";

export type SynthesizedPulseCell = {
  kind: "pulse";
  frequency: number;
  duty: DutyValue;
  gain: number;
};

export type SynthesizedNoiseCell = {
  kind: "noise";
  rate: number;
  gain: number;
};

export type SynthesizedRow = [
  SynthesizedPulseCell,
  SynthesizedPulseCell,
  SynthesizedPulseCell,
  SynthesizedNoiseCell,
];

/** Converts representation layer data into audio ready values */
export function synthesizePulseCell(pulse: PulseCell): SynthesizedPulseCell {
  return {
    kind: "pulse",
    frequency: getNoteFrequency(pulse.note),
    duty: getDutyValue(pulse.duty),
    gain: getVolume(pulse.volume.toString()),
  };
}

export function synthesizeNoiseCell(noise: NoiseCell): SynthesizedNoiseCell {
  return {
    kind: "noise",
    rate: getRateValue(noise.rate),
    gain: getVolume(noise.volume.toString()),
  };
}
