import { HelpCircleIcon } from "lucide-react";
import { useHelpOpen } from "@/atoms/help";
import { FieldGuide } from "@/features/panel/components/field-guide";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useLocation } from "react-router";

function HomeHelpContent() {
  return (
    <>
      <DialogTitle>Home</DialogTitle>
      <DialogDescription asChild>
        <div className="space-y-2">
          <p>This is the home page where you can manage your songs.</p>
          <p>
            Press <Kbd>Ctrl</Kbd> + <Kbd>N</Kbd> to quickly create a new song.
          </p>
        </div>
      </DialogDescription>
    </>
  );
}

function EditorHelpContent() {
  return (
    <>
      <DialogTitle>Editor guide</DialogTitle>
      <DialogDescription asChild>
        <div className="space-y-4">
          <p>Shortcuts and what each field in the grid does.</p>

          <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            <section className="space-y-3">
              <p className="font-semibold text-foreground text-sm">Playback</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Toggle playback</span>
                  <Kbd>Space</Kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Stop playback</span>
                  <Kbd>S</Kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Toggle loop</span>
                  <Kbd>L</Kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Reset playback range</span>
                  <Kbd>R</Kbd>
                </li>
              </ul>

              <p className="font-semibold text-foreground text-sm">
                Navigation
              </p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Move between rows</span>
                  <span>
                    <Kbd>&uarr;</Kbd> <Kbd>&darr;</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Move between fields</span>
                  <span>
                    <Kbd>&larr;</Kbd> <Kbd>&rarr;</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Deselect field</span>
                  <span>
                    <Kbd>Esc</Kbd>
                  </span>
                </li>
              </ul>

              <p className="font-semibold text-foreground text-sm">Editing</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Note fields auto-advance to the next row</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Undo</span>
                  <span>
                    <Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd>
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Redo</span>
                  <span>
                    <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Z</Kbd>
                  </span>
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <p className="font-semibold text-foreground text-sm">Fields</p>
              <FieldGuide />
            </section>
          </div>
        </div>
      </DialogDescription>
    </>
  );
}

function DefaultHelpContent() {
  return (
    <>
      <DialogTitle>Help</DialogTitle>
      <DialogDescription>
        Navigate to the home page or the editor for contextual help.
      </DialogDescription>
    </>
  );
}

export function HelpButton() {
  const { pathname } = useLocation();
  const [open, setOpen] = useHelpOpen();

  useHotkeys("h", () => setOpen({ open: !open, via: "hotkey" }), {
    preventDefault: true,
  });

  const isHome = pathname === "/";
  const isEditor = pathname.startsWith("/editor");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setOpen({ open: next, via: "button" })}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-lg"
              className="w-full h-10 text-muted-foreground"
            >
              <HelpCircleIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          Help <Kbd>H</Kbd>
        </TooltipContent>
      </Tooltip>
      <DialogContent
        className={`max-h-[85dvh] overflow-y-auto ${
          isEditor ? "sm:max-w-3xl p-6" : ""
        }`}
      >
        <DialogHeader>
          {isHome ? (
            <HomeHelpContent />
          ) : isEditor ? (
            <EditorHelpContent />
          ) : (
            <DefaultHelpContent />
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
