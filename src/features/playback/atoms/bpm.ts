import { atom, useAtom } from "jotai";
import { defaultBpm, maxBpm, minBpm } from "@/audio/constants";

const baseBpmAtom = atom<number>(defaultBpm);

/** Ignores non-finite values and clamps to [minBpm, maxBpm] so the scheduler always gets a sane tempo. */
export const bpmAtom = atom(
  (get) => get(baseBpmAtom),
  (_get, set, bpm: number) => {
    if (!Number.isFinite(bpm)) return;
    set(baseBpmAtom, Math.max(minBpm, Math.min(maxBpm, Math.round(bpm))));
  },
);

export function useBpm() {
  return useAtom(bpmAtom);
}
