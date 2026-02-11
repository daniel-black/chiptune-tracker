import { rows } from "@/audio/constants";
import { CHANNEL_CONFIG } from "@/audio/channel-config";
import { nowIso } from "@/utils/format";
import type { NoiseCell } from "./noise-cell";
import type { PulseCell } from "./pulse-cell";
import type { Pattern, Row, Song } from "./song";

function createDefaultPulseCell(): PulseCell {
  return {
    kind: "pulse",
    note: "---",
    volume: "--",
    duty: "--",
  };
}

function createDefaultNoiseCell(): NoiseCell {
  return {
    kind: "noise",
    rate: "--",
    volume: "--",
  };
}

export function createDefaultRow(): Row {
  return CHANNEL_CONFIG.map((ch) => {
    switch (ch.kind) {
      case "pulse":
        return createDefaultPulseCell();
      case "noise":
        return createDefaultNoiseCell();
    }
  });
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
