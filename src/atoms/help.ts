import { atom, useAtom, useSetAtom } from "jotai";
import { track } from "@/lib/analytics";

/** Whether the help dialog is open. Shared so other UI can open it. */
const helpOpenAtom = atom(false);

/** How the help dialog was opened, for analytics */
export type HelpOpenedVia = "button" | "hotkey" | "hint";

/** Opens or closes help, recording how it was opened */
const setHelpOpenAtom = atom(
  null,
  (get, set, { open, via }: { open: boolean; via: HelpOpenedVia }) => {
    if (open && !get(helpOpenAtom)) {
      track("help-opened", {
        via,
        page: window.location.pathname.split("/")[1] || "home",
      });
    }
    set(helpOpenAtom, open);
  },
);

export function useHelpOpen() {
  const [open] = useAtom(helpOpenAtom);
  const setOpen = useSetAtom(setHelpOpenAtom);
  return [open, setOpen] as const;
}

export function useOpenHelp(via: HelpOpenedVia) {
  const setOpen = useSetAtom(setHelpOpenAtom);
  return () => setOpen({ open: true, via });
}
