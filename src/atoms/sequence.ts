import { atom, useAtomValue, useSetAtom } from "jotai";
import { currentSongIdAtom, songAtomFamily } from "./song";
import { nowIso } from "@/utils/format";

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

/** Append a pattern ID to the end of the sequence. */
export const addToSequenceAtom = atom(null, (get, set, patternId: string) => {
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  set(songAtomFamily(songId), {
    ...song,
    patternOrder: [...song.patternOrder, patternId],
    updatedAt: nowIso(),
  });
});

/** Remove the sequence entry at the given index. */
export const removeFromSequenceAtom = atom(null, (get, set, index: number) => {
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  if (song.patternOrder.length === 1) return; // patternOrder should never be empty

  const newOrder = [...song.patternOrder];
  newOrder.splice(index, 1);

  set(songAtomFamily(songId), {
    ...song,
    patternOrder: newOrder,
    updatedAt: nowIso(),
  });
});

/** Insert a duplicate of the entry at the given index right after it. */
export const duplicateInSequenceAtom = atom(null, (get, set, index: number) => {
  const songId = get(currentSongIdAtom);
  if (!songId) return;

  const song = get(songAtomFamily(songId));
  const patternId = song.patternOrder[index];
  if (!patternId) return;

  const newOrder = [...song.patternOrder];
  newOrder.splice(index + 1, 0, patternId);

  set(songAtomFamily(songId), {
    ...song,
    patternOrder: newOrder,
    updatedAt: nowIso(),
  });
});

/** Swap a sequence entry with its adjacent neighbor. */
export const swapInSequenceAtom = atom(
  null,
  (
    get,
    set,
    { index, direction }: { index: number; direction: "up" | "down" },
  ) => {
    const songId = get(currentSongIdAtom);
    if (!songId) return;

    const song = get(songAtomFamily(songId));
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= song.patternOrder.length) return;

    const newOrder = [...song.patternOrder];
    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    set(songAtomFamily(songId), {
      ...song,
      patternOrder: newOrder,
      updatedAt: nowIso(),
    });
  },
);

/** Full replacement of patternOrder (for dnd-kit drag end). */
export const reorderSequenceAtom = atom(
  null,
  (get, set, newOrder: string[]) => {
    const songId = get(currentSongIdAtom);
    if (!songId) return;

    const song = get(songAtomFamily(songId));
    set(songAtomFamily(songId), {
      ...song,
      patternOrder: newOrder,
      updatedAt: nowIso(),
    });
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

export function useReorderSequence() {
  return useSetAtom(reorderSequenceAtom);
}
