import { atom, useAtom } from "jotai";
import { defaultBpm } from "@/audio/constants";

export const bpmAtom = atom<number>(defaultBpm);

export function useBpm() {
  return useAtom(bpmAtom);
}
