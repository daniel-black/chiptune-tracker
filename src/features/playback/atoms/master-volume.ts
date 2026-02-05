import { atom, useAtom } from "jotai";

export const masterVolumeAtom = atom<number>(50);

export const normalizedMasterVolumeAtom = atom((get) => {
  return get(masterVolumeAtom) / 100;
});

export function useMasterVolume() {
  return useAtom(masterVolumeAtom);
}
