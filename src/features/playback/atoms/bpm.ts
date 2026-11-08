import { atom, useAtom } from "jotai";
import { defaultBpm, maxBpm, minBpm } from "@/audio/constants";
import {
  currentSongIdAtom,
  songAtomFamily,
  updateCurrentSongAtom,
} from "@/atoms/song";

/**
 * Tempo of the song open in the editor. Stored on the song, so it's saved,
 * shared in links, and undoable. Writes ignore non-finite values and clamp to
 * [minBpm, maxBpm] so the scheduler always gets a sane tempo.
 */
export const bpmAtom = atom(
  (get) => {
    const songId = get(currentSongIdAtom);
    return songId ? (get(songAtomFamily(songId)).bpm ?? defaultBpm) : defaultBpm;
  },
  (get, set, bpm: number) => {
    if (!Number.isFinite(bpm)) return;
    const next = Math.max(minBpm, Math.min(maxBpm, Math.round(bpm)));
    if (next === get(bpmAtom)) return;
    set(updateCurrentSongAtom, () => ({ bpm: next }));
  },
);

export function useBpm() {
  return useAtom(bpmAtom);
}
