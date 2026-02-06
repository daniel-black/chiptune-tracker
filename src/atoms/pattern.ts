import { atom } from "jotai";
import type { Pattern, SynthesizedRow } from "../types";
import { playheadAtom } from "../features/playback/atoms/playhead";
import { currentSongIdAtom, songAtomFamily } from "./song";
import { nowIso } from "@/utils/format";
import { createDefaultPattern } from "@/models/song";
import { synthesizeNoiseCell, synthesizePulseCell } from "@/audio/synthesis";

/**
 * Read/write derived atom that delegates to the persisted
 * song pattern identified by `currentSongIdAtom`.
 */
export const patternAtom = atom(
  (get): Pattern => {
    const id = get(currentSongIdAtom);

    if (!id) {
      return createDefaultPattern();
    }

    return get(songAtomFamily(id)).pattern;
  },
  (get, set, newPattern: Pattern) => {
    const id = get(currentSongIdAtom);
    if (!id) {
      return;
    }

    const prev = get(songAtomFamily(id));
    set(songAtomFamily(id), {
      ...prev,
      pattern: newPattern,
      updatedAt: nowIso(),
    });
  },
);

/**
 * Takes the playhead (relevant to the editor, not song specific) and
 * gets the row in the current song pattern.
 */
export const playheadRowAtom = atom((get) => {
  const playhead = get(playheadAtom);
  const pattern = get(patternAtom);

  return pattern[playhead];
});

export const synthesizedPlayheadRowAtom = atom<SynthesizedRow>((get) => {
  const playhead = get(playheadAtom);
  const pattern = get(patternAtom);
  const row = pattern[playhead];

  return [
    synthesizePulseCell(row[0]),
    synthesizePulseCell(row[1]),
    synthesizePulseCell(row[2]),
    synthesizeNoiseCell(row[3]),
  ] as const;
});
