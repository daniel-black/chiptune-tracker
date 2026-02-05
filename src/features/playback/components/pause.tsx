import { useAtomValue, useSetAtom } from "jotai";
import { canPausePlaybackAtom, pausePlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { PauseIcon } from "lucide-react";

export function Pause() {
  const canPause = useAtomValue(canPausePlaybackAtom);
  const pausePlayback = useSetAtom(pausePlaybackAtom);

  return (
    <Button
      variant="secondary"
      size="icon-lg"
      disabled={!canPause}
      onClick={pausePlayback}
    >
      <PauseIcon />
    </Button>
  );
}
