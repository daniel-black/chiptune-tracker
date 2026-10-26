import { useHotkeys } from "react-hotkeys-hook";
import { Redo2Icon, Undo2Icon } from "lucide-react";
import { useSongHistory } from "@/atoms/song-history";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Grid cells are inputs too, so undo has to work in form fields. Other text
// fields (song name, pattern name, BPM) keep the browser's own text undo.
const hotkeyOptions = {
  enableOnFormTags: true,
  preventDefault: true,
  ignoreEventWhen: (e: KeyboardEvent) =>
    e.target instanceof HTMLInputElement &&
    !e.target.hasAttribute("data-field"),
} as const;

export function UndoRedo() {
  const { canUndo, canRedo, undo, redo } = useSongHistory();

  useHotkeys("mod+z", () => undo(), hotkeyOptions);
  useHotkeys(["mod+shift+z", "mod+y"], () => redo(), hotkeyOptions);

  return (
    <ButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={!canUndo}
            onClick={undo}
            aria-label="Undo"
          >
            <Undo2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Undo <Kbd>Ctrl</Kbd> + <Kbd>Z</Kbd>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={!canRedo}
            onClick={redo}
            aria-label="Redo"
          >
            <Redo2Icon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          Redo <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Z</Kbd>
        </TooltipContent>
      </Tooltip>
    </ButtonGroup>
  );
}
