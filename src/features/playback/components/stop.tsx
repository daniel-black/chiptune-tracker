import { useAtomValue, useSetAtom } from "jotai";
import { canStopPlaybackAtom, stopPlaybackAtom } from "../../atoms/playback";

export function Stop() {
  const canStop = useAtomValue(canStopPlaybackAtom);
  const stopPlayback = useSetAtom(stopPlaybackAtom);

  return (
    <button disabled={!canStop} onClick={stopPlayback}>
      Stop
    </button>
  );
}
