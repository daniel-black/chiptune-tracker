import { useAtomValue, useSetAtom } from "jotai";
import { canStartPlaybackAtom, startPlaybackAtom } from "../atoms/playback";
import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";

export function Start() {
  const canStart = useAtomValue(canStartPlaybackAtom);
  const startPlayback = useSetAtom(startPlaybackAtom);

  return (
    <Button size="icon" disabled={!canStart} onClick={startPlayback}>
      <PlayIcon />
    </Button>
  );
}
