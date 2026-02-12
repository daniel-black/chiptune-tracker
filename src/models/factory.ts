import { rows } from "@/audio/constants";
import { CHANNEL_CONFIG } from "@/audio/channel-config";
import { nowIso } from "@/utils/format";
import type { NoiseCell } from "./noise-cell";
import type { PulseCell } from "./pulse-cell";
import type { NamedPattern, Pattern, Row, Song } from "./song";

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

export function createNamedPattern(id: string, name: string): NamedPattern {
  return {
    id,
    name,
    data: createDefaultPattern(),
  };
}

export function createNewSong(uuid: string): Song {
  const now = nowIso();
  const patternId = crypto.randomUUID();
  const pattern = createNamedPattern(patternId, "Pattern 1");

  return {
    name: "",
    id: uuid,
    createdAt: now,
    updatedAt: now,
    patterns: { [patternId]: pattern },
    patternOrder: [patternId],
  };
}
