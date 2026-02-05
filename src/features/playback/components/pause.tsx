import { useAtomValue, useSetAtom } from "jotai";
import { canPausePlaybackAtom, pausePlaybackAtom } from "../atoms/playback";

export function Pause() {
  const canPause = useAtomValue(canPausePlaybackAtom);
  const pausePlayback = useSetAtom(pausePlaybackAtom);

  return (
    <button
      className="px-2 border disabled:text-gray-500"
      disabled={!canPause}
      onClick={pausePlayback}
    >
      PAUSE
    </button>
  );
}
