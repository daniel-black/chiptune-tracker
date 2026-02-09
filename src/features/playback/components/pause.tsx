import { useAtomValue, useSetAtom } from "jotai";
import { canPausePlaybackAtom, pausePlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PauseIcon } from "lucide-react";

export function Pause() {
  const canPause = useAtomValue(canPausePlaybackAtom);
  const pausePlayback = useSetAtom(pausePlaybackAtom);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          disabled={!canPause}
          onClick={pausePlayback}
        >
          <PauseIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Pause <Kbd>Ctrl</Kbd> + <Kbd>Space</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
