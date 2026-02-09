import { HelpCircleIcon } from "lucide-react";
import { useState } from "react";
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
      <DialogTitle>Editor Keyboard Shortcuts</DialogTitle>
      <DialogDescription asChild>
        <div className="space-y-3">
          <p>Use these shortcuts while editing a song</p>
          <ul className="space-y-2">
            <li className="flex items-center justify-between">
              <span>Toggle playback</span>
              <span>
                <Kbd>Ctrl</Kbd> + <Kbd>Space</Kbd>
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Stop playback</span>
              <span>
                <Kbd>Ctrl</Kbd> + <Kbd>E</Kbd>
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Toggle loop</span>
              <span>
                <Kbd>Ctrl</Kbd> + <Kbd>L</Kbd>
              </span>
            </li>
          </ul>
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
  const [open, setOpen] = useState(false);

  useHotkeys("ctrl+q", () => setOpen((prev) => !prev), {
    preventDefault: true,
  });

  const isHome = pathname === "/";
  const isEditor = pathname.startsWith("/editor");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="w-full h-10">
              <HelpCircleIcon />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          Help <Kbd>Ctrl</Kbd> + <Kbd>Q</Kbd>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
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
