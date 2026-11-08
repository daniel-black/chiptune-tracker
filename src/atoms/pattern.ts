import { atom } from "jotai";
import { playheadAtom } from "@/features/playback/atoms/playhead";
import {
  currentPatternIdAtom,
  currentSongIdAtom,
  songAtomFamily,
  updateCurrentSongAtom,
} from "./song";
import { type Pattern } from "@/models/song";
import { createDefaultPattern } from "@/models/factory";
import type { PulseCell } from "@/models/pulse-cell";
import { isMusicalNote } from "@/audio/characteristics/notes";
import { recordEdit } from "@/lib/analytics";
import { getSongSource } from "@/lib/song-source";

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
    const patternId = get(currentPatternIdAtom);
    if (!patternId) {
      return;
    }

    set(updateCurrentSongAtom, (song) => {
      const prevNamedPattern = song.patterns[patternId];
      if (!prevNamedPattern) {
        return null;
      }

      recordEdit(
        countNotesEntered(prevNamedPattern.data, newPattern),
        getSongSource(song),
      );

      return {
        patterns: {
          ...song.patterns,
          [patternId]: { ...prevNamedPattern, data: newPattern },
        },
      };
    });
  },
);

/** Cells that now hold a pitch they didn't hold before */
function countNotesEntered(prev: Pattern, next: Pattern): number {
  let count = 0;
  next.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (
        cell.kind === "pulse" &&
        isMusicalNote(cell.note) &&
        cell.note !== (prev[r]?.[c] as PulseCell | undefined)?.note
      ) {
        count++;
      }
    }),
  );
  return count;
}

/**
 * Takes the playhead (relevant to the editor, not song specific) and
 * gets the row in the current song pattern.
 */
export const playheadRowAtom = atom((get) => {
  const playhead = get(playheadAtom);
  const pattern = get(patternAtom);

  return pattern[playhead];
});
