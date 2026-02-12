import { useAtomValue, useSetAtom } from "jotai";
import { canStartPlaybackAtom, startPlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import { TogglePlaybackTooltip } from "./toggle-playback-tooltip";

export function Start() {
  const canStart = useAtomValue(canStartPlaybackAtom);
  const startPlayback = useSetAtom(startPlaybackAtom);

  return (
    <TogglePlaybackTooltip type="Play">
      <Button size="icon" disabled={!canStart} onClick={startPlayback}>
        <PlayIcon />
      </Button>
    </TogglePlaybackTooltip>
  );
}
