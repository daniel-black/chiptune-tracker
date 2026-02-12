import { atom } from "jotai";
import { playheadAtom } from "@/features/playback/atoms/playhead";
import {
  currentPatternIdAtom,
  currentSongIdAtom,
  songAtomFamily,
} from "./song";
import { nowIso } from "@/utils/format";
import { type Pattern } from "@/models/song";
import { synthesizeCell, type SynthesizedRow } from "@/audio/synthesis";
import { createDefaultPattern } from "@/models/factory";

/**
 * Read/write derived atom that delegates to the persisted
 * song pattern identified by `currentSongIdAtom` + `currentPatternIdAtom`.
 */
export const patternAtom = atom(
  (get): Pattern => {
    const songId = get(currentSongIdAtom);
    const patternId = get(currentPatternIdAtom);

    if (!songId || !patternId) {
      return createDefaultPattern();
    }

    const song = get(songAtomFamily(songId));
    const namedPattern = song.patterns[patternId];

    if (!namedPattern) {
      return createDefaultPattern();
    }

    return namedPattern.data;
  },
  (get, set, newPattern: Pattern) => {
    const songId = get(currentSongIdAtom);
    const patternId = get(currentPatternIdAtom);
    if (!songId || !patternId) {
      return;
    }

    const prev = get(songAtomFamily(songId));
    const prevNamedPattern = prev.patterns[patternId];
    if (!prevNamedPattern) {
      return;
    }

    set(songAtomFamily(songId), {
      ...prev,
      patterns: {
        ...prev.patterns,
        [patternId]: {
          ...prevNamedPattern,
          data: newPattern,
        },
      },
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

  return row.map(synthesizeCell);
});
