import { rows } from "@/audio/constants";
import { nowIso } from "@/utils/format";
import type { NoiseCell } from "./noise-cell";
import type { PulseCell } from "./pulse-cell";
import type { Pattern, Row, Song } from "./song";

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

export function createDefaultPattern(): Pattern {
  return Array.from({ length: rows }, createDefaultRow);
}

export function createNewSong(uuid: string): Song {
  const now = nowIso();

  return {
    name: "",
    id: uuid,
    createdAt: now,
    updatedAt: now,
    pattern: createDefaultPattern(),
  };
}
