import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai-family";
import { CHANNEL_COUNT } from "@/audio/channel-config";

export const channelEnableBaseAtom = atom<boolean[]>(
  Array.from({ length: CHANNEL_COUNT }, () => true),
);

export const channelEnableAtomFamily = atomFamily((index: number) =>
  atom(
    (get) => get(channelEnableBaseAtom)[index],
    (get, set, next: boolean | ((prev: boolean) => boolean)) => {
      const prevArr = get(channelEnableBaseAtom);
      const prevVal = prevArr[index];
      const nextVal = typeof next === "function" ? next(prevVal) : next;

      if (nextVal === prevVal) return;

      const copy = [...prevArr];
      copy[index] = nextVal;
      set(channelEnableBaseAtom, copy);
    },
  ),
);

export const toggleChannelEnableAtom = atom(
  null,
  (_, set, index: number) => {
    set(channelEnableAtomFamily(index), (prev) => !prev);
  },
);

export function useChannelEnable(index: number) {
  const isEnabled = useAtomValue(channelEnableAtomFamily(index));
  const toggle = useSetAtom(toggleChannelEnableAtom);

  return { isEnabled, toggleEnable: () => toggle(index) } as const;
}
