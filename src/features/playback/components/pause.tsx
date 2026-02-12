import { useAtomValue, useSetAtom } from "jotai";
import { canPausePlaybackAtom, pausePlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { PauseIcon } from "lucide-react";
import { TogglePlaybackTooltip } from "./toggle-playback-tooltip";

export function Pause() {
  const canPause = useAtomValue(canPausePlaybackAtom);
  const pausePlayback = useSetAtom(pausePlaybackAtom);

  return (
    <TogglePlaybackTooltip type="Pause">
      <Button
        variant="secondary"
        size="icon"
        disabled={!canPause}
        onClick={pausePlayback}
      >
        <PauseIcon />
      </Button>
    </TogglePlaybackTooltip>
  );
}
