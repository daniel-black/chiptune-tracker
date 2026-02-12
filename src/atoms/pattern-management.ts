import { atom, useAtomValue, useSetAtom } from "jotai";
import {
  currentPatternIdAtom,
  currentSongIdAtom,
  songAtomFamily,
} from "./song";
import { type NamedPattern } from "@/models/song";
import { createNamedPattern } from "@/models/factory";
import { nowIso } from "@/utils/format";
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
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  const patternId = crypto.randomUUID();
  const pattern = createNamedPattern(patternId, "Untitled Pattern");

  set(songAtomFamily(songId), {
    ...song,
    patterns: { ...song.patterns, [patternId]: pattern },
    patternOrder: [...song.patternOrder, patternId],
    updatedAt: nowIso(),
  });

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

  set(songAtomFamily(songId), {
    ...song,
    patterns: { ...song.patterns, [patternId]: duplicate },
    patternOrder: newOrder,
    updatedAt: nowIso(),
  });

  set(switchPatternAtom, patternId);
});

/** Rename a pattern by ID. */
export const renamePatternAtom = atom(
  null,
  (get, set, { patternId, name }: { patternId: string; name: string }) => {
    const songId = get(currentSongIdAtom);
    if (!songId) return;

    const song = get(songAtomFamily(songId));
    const pattern = song.patterns[patternId];
    if (!pattern) return;

    set(songAtomFamily(songId), {
      ...song,
      patterns: {
        ...song.patterns,
        [patternId]: { ...pattern, name },
      },
      updatedAt: nowIso(),
    });
  },
);

/** Delete a pattern. Prevents deleting the last pattern. */
export const deletePatternAtom = atom(null, (get, set, patternId: string) => {
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  if (song.patternOrder.length <= 1) return;

  const newOrder = song.patternOrder.filter((id) => id !== patternId);
  const remainingPatterns = Object.fromEntries(
    Object.entries(song.patterns).filter(([id]) => id !== patternId),
  );

  set(songAtomFamily(songId), {
    ...song,
    patterns: remainingPatterns,
    patternOrder: newOrder,
    updatedAt: nowIso(),
  });

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
