import type { Duty } from "@/audio/characteristics/duty";
import type { MusicalNote } from "@/audio/characteristics/notes";
import type { VolumeLevel } from "@/audio/characteristics/volume";

export type PulseCell = {
  kind: "pulse";
  note: MusicalNote | "OFF" | "---";
  duty: Duty | "--";
  volume: VolumeLevel | "--";
};
