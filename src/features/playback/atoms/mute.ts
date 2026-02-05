import { atom, useAtomValue, useSetAtom } from "jotai";
import { atomFamily } from "jotai-family";

export type ChannelIndex = 0 | 1 | 2 | 3;

export const channelMuteBaseAtom = atom<[boolean, boolean, boolean, boolean]>([
  false,
  false,
  false,
  false,
]);

export const channelMuteAtomFamily = atomFamily((index: ChannelIndex) =>
  atom(
    (get) => get(channelMuteBaseAtom)[index],
    (get, set, next: boolean | ((prev: boolean) => boolean)) => {
      const prevArr = get(channelMuteBaseAtom);
      const prevVal = prevArr[index];
      const nextVal = typeof next === "function" ? next(prevVal) : next;

      if (nextVal === prevVal) return;

      const copy = prevArr.slice() as [boolean, boolean, boolean, boolean];
      copy[index] = nextVal;
      set(channelMuteBaseAtom, copy);
    },
  ),
);

export const toggleChannelMuteAtom = atom(
  null,
  (_, set, index: ChannelIndex) => {
    set(channelMuteAtomFamily(index), (prev) => !prev);
  },
);

export function useChannelMute(index: ChannelIndex) {
  const isMuted = useAtomValue(channelMuteAtomFamily(index));
  const toggle = useSetAtom(toggleChannelMuteAtom);

  return { isMuted, toggleMute: () => toggle(index) } as const;
}
