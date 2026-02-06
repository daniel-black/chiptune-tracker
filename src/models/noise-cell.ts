import type { Rate } from "@/audio/characteristics/rate";
import type { VolumeLevel } from "@/audio/characteristics/volume";

export type NoiseCell = {
  kind: "noise";
  rate: Rate | "--";
  volume: VolumeLevel | "--";
};
