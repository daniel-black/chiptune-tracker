import { atom, useAtomValue, useSetAtom } from "jotai";
import { REDO, RESET, UNDO, withHistory } from "jotai-history";
import { type Song } from "@/models/song";
import { nowIso } from "@/utils/format";
import {
  currentPatternIdAtom,
  currentSongIdAtom,
  songAtomFamily,
} from "./song";
import { switchPatternAtom } from "./pattern-management";

const historyLimit = 100;

/** The song open in the editor, as a single atom that history can track. */
const currentSongAtom = atom(
  (get): Song | null => {
    const songId = get(currentSongIdAtom);
    return songId ? get(songAtomFamily(songId)) : null;
  },
  (get, set, song: Song | null) => {
    const songId = get(currentSongIdAtom);
    if (!songId || !song || song.id !== songId) return;

    set(songAtomFamily(songId), { ...song, updatedAt: nowIso() });
  },
);

/**
 * Undo/redo over every change to the current song. History is only recorded
 * while this atom is mounted (see useSongHistory) and is reset when the open
 * song changes.
 */
const songHistoryAtom = withHistory(currentSongAtom, historyLimit);

/** Undoing can remove the pattern being edited (e.g. undo "create pattern"). */
const ensureCurrentPatternExistsAtom = atom(null, (get, set) => {
  const song = get(currentSongAtom);
  const patternId = get(currentPatternIdAtom);
  if (!song || (patternId && song.patterns[patternId])) return;

  set(switchPatternAtom, song.patternOrder[0]);
});

const undoAtom = atom(null, (_get, set) => {
  set(songHistoryAtom, UNDO);
  set(ensureCurrentPatternExistsAtom);
});

const redoAtom = atom(null, (_get, set) => {
  set(songHistoryAtom, REDO);
  set(ensureCurrentPatternExistsAtom);
});

export const resetSongHistoryAtom = atom(null, (_get, set) => {
  set(songHistoryAtom, RESET);
});

/** Mounts song history; render this once inside the editor. */
export function useSongHistory() {
  const { canUndo, canRedo } = useAtomValue(songHistoryAtom);
  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);

  return { canUndo, canRedo, undo, redo };
}

export function useResetSongHistory() {
  return useSetAtom(resetSongHistoryAtom);
}
