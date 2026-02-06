import { atom, useAtom } from "jotai";
import type {
  NoiseCell,
  PulseCell,
  Song,
  SynthesizedNoiseCell,
  SynthesizedPulseCell,
  SynthesizedRow,
} from "../types";
import { createDefaultSong } from "../audio/utils";

import { getNoteFrequency } from "../audio/notes";
import { getDutyValue } from "../audio/duty";
import { getVolume } from "../audio/volume";
import { getRateValue } from "../audio/rate";
import { playheadAtom } from "../features/playback/atoms/playhead";
import { songAtomFamily } from "./library";
import { nowIso } from "@/utils/format";

/** UUID of the song currently open in the editor (set by TrackerPage). */
export const currentSongIdAtom = atom<string | null>(null);

/**
 * Derived read/write atom that transparently delegates to the persisted
 * song identified by `currentSongIdAtom`. All existing editor code that
 * reads/writes `songAtom` continues to work unchanged.
 */
export const songAtom = atom(
  (get): Song => {
    const id = get(currentSongIdAtom);
    if (!id) return createDefaultSong();
    return get(songAtomFamily(id)).pattern;
  },
  (get, set, newSong: Song) => {
    const id = get(currentSongIdAtom);
    if (!id) return;
    const prev = get(songAtomFamily(id));
    set(songAtomFamily(id), {
      ...prev,
      pattern: newSong,
      updatedAt: nowIso(),
    });
  },
);

export const playheadRowAtom = atom((get) => {
  const playhead = get(playheadAtom);
  const song = get(songAtom);

  return song[playhead];
});

export const synthesizedPlayheadRow = atom<SynthesizedRow>((get) => {
  const playhead = get(playheadAtom);
  const song = get(songAtom);
  const row = song[playhead];

  return [
    synthesizePulseCell(row[0]),
    synthesizePulseCell(row[1]),
    synthesizePulseCell(row[2]),
    synthesizeNoiseCell(row[3]),
  ] as const;
});

function synthesizePulseCell(pulse: PulseCell): SynthesizedPulseCell {
  return {
    kind: "pulse",
    frequency: getNoteFrequency(pulse.note),
    duty: getDutyValue(pulse.duty),
    gain: getVolume(pulse.volume.toString()),
  };
}

function synthesizeNoiseCell(noise: NoiseCell): SynthesizedNoiseCell {
  return {
    kind: "noise",
    rate: getRateValue(noise.rate),
    gain: getVolume(noise.volume.toString()),
  };
}

const songNameAtom = atom(
  (get): string => {
    const id = get(currentSongIdAtom);
    if (!id) return "";
    return get(songAtomFamily(id)).name;
  },
  (get, set, name: string) => {
    const id = get(currentSongIdAtom);
    if (!id) return;
    const prev = get(songAtomFamily(id));
    set(songAtomFamily(id), {
      ...prev,
      name,
      updatedAt: nowIso(),
    });
  },
);

export function useSongName() {
  return useAtom(songNameAtom);
}
