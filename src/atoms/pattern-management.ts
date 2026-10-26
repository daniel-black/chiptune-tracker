import { atom, useAtomValue, useSetAtom } from "jotai";
import {
  currentPatternIdAtom,
  currentSongIdAtom,
  songAtomFamily,
  updateCurrentSongAtom,
} from "./song";
import { type NamedPattern } from "@/models/song";
import { createNamedPattern } from "@/models/factory";
import { sequencePositionAtom } from "@/features/playback/atoms/sequence-position";
import { stopPlaybackAtom } from "@/features/playback/atoms/playback";
import { resetPlaybackRangeAtom } from "@/features/playback/atoms/range";
import { playheadAtom } from "@/features/playback/atoms/playhead";

/** Unique patterns in the current song (one entry per pattern, regardless of sequence duplicates). */
export const patternListAtom = atom((get): NamedPattern[] => {
  const songId = get(currentSongIdAtom);
  if (!songId) return [];

  const song = get(songAtomFamily(songId));
  return Object.values(song.patterns);
});

/** Name of the currently selected pattern. */
export const currentPatternNameAtom = atom((get): string => {
  const songId = get(currentSongIdAtom);
  const patternId = get(currentPatternIdAtom);
  if (!songId || !patternId) return "";

  const song = get(songAtomFamily(songId));
  return song.patterns[patternId]?.name ?? "";
});

/** Switch to a different pattern. Stops playback and resets range/playhead. */
export const switchPatternAtom = atom(null, (get, set, patternId: string) => {
  if (get(currentPatternIdAtom) === patternId) return;

  set(stopPlaybackAtom);
  set(resetPlaybackRangeAtom);
  set(playheadAtom, 0);
  set(currentPatternIdAtom, patternId);
});

/** Create a new empty pattern and switch to it. */
export const createPatternAtom = atom(null, (get, set) => {
  if (!get(currentSongIdAtom)) return;

  const patternId = crypto.randomUUID();
  const pattern = createNamedPattern(patternId, "Untitled Pattern");

  set(updateCurrentSongAtom, (song) => ({
    patterns: { ...song.patterns, [patternId]: pattern },
    patternOrder: [...song.patternOrder, patternId],
  }));

  set(switchPatternAtom, patternId);
});

/** Deep-copy a pattern's data and insert after it in order. */
export const duplicatePatternAtom = atom(null, (get, set, sourceId: string) => {
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  const source = song.patterns[sourceId];
  if (!source) return;

  const patternId = crypto.randomUUID();
  const duplicate: NamedPattern = {
    id: patternId,
    name: `${source.name} (copy)`,
    data: structuredClone(source.data),
  };

  const sourceIndex = song.patternOrder.indexOf(sourceId);
  const newOrder = [...song.patternOrder];
  newOrder.splice(sourceIndex + 1, 0, patternId);

  set(updateCurrentSongAtom, () => ({
    patterns: { ...song.patterns, [patternId]: duplicate },
    patternOrder: newOrder,
  }));

  set(switchPatternAtom, patternId);
});

/** Rename a pattern by ID. */
export const renamePatternAtom = atom(
  null,
  (_get, set, { patternId, name }: { patternId: string; name: string }) => {
    set(updateCurrentSongAtom, (song) => {
      const pattern = song.patterns[patternId];
      if (!pattern) return null;

      return {
        patterns: { ...song.patterns, [patternId]: { ...pattern, name } },
      };
    });
  },
);

/** Delete a pattern and its sequence entries. Prevents deleting the last pattern. */
export const deletePatternAtom = atom(null, (get, set, patternId: string) => {
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  if (!song.patterns[patternId]) return;

  const remainingPatterns = Object.fromEntries(
    Object.entries(song.patterns).filter(([id]) => id !== patternId),
  );
  const remainingIds = Object.keys(remainingPatterns);
  if (remainingIds.length === 0) return;

  let newOrder = song.patternOrder.filter((id) => id !== patternId);
  // patternOrder must never be empty
  if (newOrder.length === 0) newOrder = [remainingIds[0]];

  set(updateCurrentSongAtom, () => ({
    patterns: remainingPatterns,
    patternOrder: newOrder,
  }));

  // Keep the sequence position on the same entry
  const pos = get(sequencePositionAtom);
  const removedBefore = song.patternOrder
    .slice(0, pos)
    .filter((id) => id === patternId).length;
  if (removedBefore > 0) {
    set(sequencePositionAtom, pos - removedBefore);
  }

  // If we deleted the current pattern, switch to first
  if (get(currentPatternIdAtom) === patternId) {
    set(switchPatternAtom, newOrder[0]);
  }
});

export function usePatternList() {
  return useAtomValue(patternListAtom);
}

export function useCurrentPatternName() {
  return useAtomValue(currentPatternNameAtom);
}

export function useSwitchPattern() {
  return useSetAtom(switchPatternAtom);
}

export function useCreatePattern() {
  return useSetAtom(createPatternAtom);
}

export function useDuplicatePattern() {
  return useSetAtom(duplicatePatternAtom);
}

export function useRenamePattern() {
  return useSetAtom(renamePatternAtom);
}

export function useDeletePattern() {
  return useSetAtom(deletePatternAtom);
}
