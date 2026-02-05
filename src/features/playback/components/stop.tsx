import { useAtomValue, useSetAtom } from "jotai";
import { canStopPlaybackAtom, stopPlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { SquareIcon } from "lucide-react";

export function Stop() {
  const canStop = useAtomValue(canStopPlaybackAtom);
  const stopPlayback = useSetAtom(stopPlaybackAtom);

  return (
    <Button
      variant="destructive"
      size="icon"
      disabled={!canStop}
      onClick={stopPlayback}
    >
      <SquareIcon />
    </Button>
  );
}
