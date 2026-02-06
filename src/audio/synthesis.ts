import type {
  NoiseCell,
  PulseCell,
  SynthesizedNoiseCell,
  SynthesizedPulseCell,
} from "@/types";
import { getNoteFrequency } from "./notes";
import { getDutyValue } from "./duty";
import { getVolume } from "./volume";
import { getRateValue } from "./rate";

/**Converts representation layer data into audio ready values */
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
