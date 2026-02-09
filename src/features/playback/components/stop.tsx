import { useAtomValue, useSetAtom } from "jotai";
import { canStopPlaybackAtom, stopPlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SquareIcon } from "lucide-react";

export function Stop() {
  const canStop = useAtomValue(canStopPlaybackAtom);
  const stopPlayback = useSetAtom(stopPlaybackAtom);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          disabled={!canStop}
          onClick={stopPlayback}
        >
          <SquareIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Stop <Kbd>Ctrl</Kbd> + <Kbd>E</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
