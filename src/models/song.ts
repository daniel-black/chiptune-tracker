import { nowIso } from "@/utils/format";
import type {
  NoiseCell,
  PersistedSong,
  PulseCell,
  Row,
  Pattern,
} from "../types";
import { rows } from "@/audio/constants";

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

export function createNewPersistedSong(uuid: string): PersistedSong {
  const now = nowIso();

  return {
    name: "",
    id: uuid,
    createdAt: now,
    updatedAt: now,
    pattern: createDefaultPattern(),
  };
}
