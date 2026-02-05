import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai-family";

export type ChannelIndex = 0 | 1 | 2 | 3;

export const channelEnableBaseAtom = atom<[boolean, boolean, boolean, boolean]>(
  [true, true, true, true],
);

export const channelEnableAtomFamily = atomFamily((index: ChannelIndex) =>
  atom(
    (get) => get(channelEnableBaseAtom)[index],
    (get, set, next: boolean | ((prev: boolean) => boolean)) => {
      const prevArr = get(channelEnableBaseAtom);
      const prevVal = prevArr[index];
      const nextVal = typeof next === "function" ? next(prevVal) : next;

      if (nextVal === prevVal) return;

      const copy = prevArr.slice() as [boolean, boolean, boolean, boolean];
      copy[index] = nextVal;
      set(channelEnableBaseAtom, copy);
    },
  ),
);

export const toggleChannelEnableAtom = atom(
  null,
  (_, set, index: ChannelIndex) => {
    set(channelEnableAtomFamily(index), (prev) => !prev);
  },
);

export function useChannelEnable(index: ChannelIndex) {
  const isEnabled = useAtomValue(channelEnableAtomFamily(index));
  const toggle = useSetAtom(toggleChannelEnableAtom);

  return { isEnabled, toggleEnable: () => toggle(index) } as const;
}
