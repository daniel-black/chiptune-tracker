import { atom, useAtomValue, useSetAtom } from "jotai";

export type EditorInputType = "note" | "duty" | "volume" | "rate" | null;

const focusedInputTypeAtom = atom<EditorInputType>(null);

export function useFocusedInputTypeValue() {
  return useAtomValue(focusedInputTypeAtom);
}

export function useSetFocusedInputType() {
  return useSetAtom(focusedInputTypeAtom);
}
