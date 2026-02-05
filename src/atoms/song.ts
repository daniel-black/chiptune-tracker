import { atom } from "jotai";
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

// Canonical, row-major song atom
export const songAtom = atom<Song>(createDefaultSong());

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
