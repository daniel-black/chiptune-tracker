import { useAtomValue, useSetAtom } from "jotai";
import { canStartPlaybackAtom, startPlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlayIcon } from "lucide-react";

export function Start() {
  const canStart = useAtomValue(canStartPlaybackAtom);
  const startPlayback = useSetAtom(startPlaybackAtom);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" disabled={!canStart} onClick={startPlayback}>
          <PlayIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Play <Kbd>Ctrl</Kbd> + <Kbd>Space</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
