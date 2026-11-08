import { atom, useAtomValue, useSetAtom } from "jotai";
import {
  currentPatternIdAtom,
  currentSongIdAtom,
  songAtomFamily,
  updateCurrentSongAtom,
} from "./song";
import { switchPatternAtom } from "./pattern-management";
import { sequencePositionAtom } from "@/features/playback/atoms/sequence-position";
import { stopPlaybackAtom } from "@/features/playback/atoms/playback";

export type SequenceEntry = {
  index: number;
  patternId: string;
  name: string;
};

/** Ordered sequence entries derived from patternOrder. */
export const sequenceListAtom = atom((get): SequenceEntry[] => {
  const songId = get(currentSongIdAtom);
  if (!songId) return [];

  const song = get(songAtomFamily(songId));
  return song.patternOrder.map((patternId, index) => ({
    index,
    patternId,
    name: song.patterns[patternId]?.name ?? "Unknown",
  }));
});

/**
 * The arrangement entry the editor is on: the sequence position if it points
 * at the pattern being edited, otherwise that pattern's first entry. -1 when
 * the pattern isn't in the arrangement. Playback starts from this entry.
 */
export const selectedSequenceIndexAtom = atom((get): number => {
  const songId = get(currentSongIdAtom);
  const patternId = get(currentPatternIdAtom);
  if (!songId || !patternId) return -1;

  const { patternOrder } = get(songAtomFamily(songId));
  const pos = get(sequencePositionAtom);
  return patternOrder[pos] === patternId ? pos : patternOrder.indexOf(patternId);
});

/** How many times each pattern appears in the arrangement */
export const patternUsageAtom = atom((get): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const entry of get(sequenceListAtom)) {
    counts[entry.patternId] = (counts[entry.patternId] ?? 0) + 1;
  }
  return counts;
});

/** Open a specific arrangement entry in the editor; playback starts there. */
export const selectSequenceEntryAtom = atom(
  null,
  (get, set, index: number) => {
    const songId = get(currentSongIdAtom);
    if (!songId) return;
    const patternId = get(songAtomFamily(songId)).patternOrder[index];
    if (!patternId) return;

    if (get(selectedSequenceIndexAtom) !== index) set(stopPlaybackAtom);
    set(switchPatternAtom, patternId);
    set(sequencePositionAtom, index);
  },
);

/** Append a pattern ID to the end of the sequence. */
export const addToSequenceAtom = atom(null, (_get, set, patternId: string) => {
  set(updateCurrentSongAtom, (song) => ({
    patternOrder: [...song.patternOrder, patternId],
  }));
});

/** Remove the sequence entry at the given index. */
export const removeFromSequenceAtom = atom(null, (get, set, index: number) => {
  let removed = false;
  set(updateCurrentSongAtom, (song) => {
    if (song.patternOrder.length === 1) return null; // patternOrder should never be empty

    const newOrder = [...song.patternOrder];
    newOrder.splice(index, 1);
    removed = true;
    return { patternOrder: newOrder };
  });
  if (!removed) return;

  // Keep playback pointing at the same entry. If the playing entry itself was
  // removed, step back one so the entry that took its place plays next.
  const pos = get(sequencePositionAtom);
  if (pos >= index) {
    set(sequencePositionAtom, pos - 1);
  }
});

/** Insert a duplicate of the entry at the given index right after it. */
export const duplicateInSequenceAtom = atom(null, (get, set, index: number) => {
  let inserted = false;
  set(updateCurrentSongAtom, (song) => {
    const patternId = song.patternOrder[index];
    if (!patternId) return null;

    const newOrder = [...song.patternOrder];
    newOrder.splice(index + 1, 0, patternId);
    inserted = true;
    return { patternOrder: newOrder };
  });
  if (!inserted) return;

  const pos = get(sequencePositionAtom);
  if (pos > index) {
    set(sequencePositionAtom, pos + 1);
  }
});

/** Swap a sequence entry with its adjacent neighbor. */
export const swapInSequenceAtom = atom(
  null,
  (
    _get,
    set,
    { index, direction }: { index: number; direction: "up" | "down" },
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    set(moveInSequenceAtom, { from: index, to: targetIndex });
  },
);

/** Move a sequence entry from one index to another (for dnd-kit drag end). */
export const moveInSequenceAtom = atom(
  null,
  (get, set, { from, to }: { from: number; to: number }) => {
    let moved = false;
    set(updateCurrentSongAtom, (song) => {
      const length = song.patternOrder.length;
      if (from === to || from < 0 || to < 0 || from >= length || to >= length) {
        return null;
      }

      const newOrder = [...song.patternOrder];
      const [entry] = newOrder.splice(from, 1);
      newOrder.splice(to, 0, entry);
      moved = true;
      return { patternOrder: newOrder };
    });
    if (!moved) return;

    // Follow the playing entry to its new index
    const pos = get(sequencePositionAtom);
    if (pos === from) {
      set(sequencePositionAtom, to);
    } else if (from < pos && pos <= to) {
      set(sequencePositionAtom, pos - 1);
    } else if (to <= pos && pos < from) {
      set(sequencePositionAtom, pos + 1);
    }
  },
);

export function useSequenceList() {
  return useAtomValue(sequenceListAtom);
}

export function useAddToSequence() {
  return useSetAtom(addToSequenceAtom);
}

export function useRemoveFromSequence() {
  return useSetAtom(removeFromSequenceAtom);
}

export function useDuplicateInSequence() {
  return useSetAtom(duplicateInSequenceAtom);
}

export function useSwapInSequence() {
  return useSetAtom(swapInSequenceAtom);
}

export function useMoveInSequence() {
  return useSetAtom(moveInSequenceAtom);
}

export function useSelectedSequenceIndex() {
  return useAtomValue(selectedSequenceIndexAtom);
}

export function usePatternUsage() {
  return useAtomValue(patternUsageAtom);
}

export function useSelectSequenceEntry() {
  return useSetAtom(selectSequenceEntryAtom);
}
