import { useAtomValue, useSetAtom } from "jotai";
import { canStopPlaybackAtom, stopPlaybackAtom } from "../atoms/playback";

export function Stop() {
  const canStop = useAtomValue(canStopPlaybackAtom);
  const stopPlayback = useSetAtom(stopPlaybackAtom);

  return (
    <button
      className="px-2 border disabled:text-gray-500"
      disabled={!canStop}
      onClick={stopPlayback}
    >
      STOP
    </button>
  );
}
