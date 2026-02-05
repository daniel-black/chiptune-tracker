import { useAtomValue, useSetAtom } from "jotai";
import { canPausePlaybackAtom, pausePlaybackAtom } from "../../atoms/playback";

export function Pause() {
  const canPause = useAtomValue(canPausePlaybackAtom);
  const pausePlayback = useSetAtom(pausePlaybackAtom);

  return (
    <button disabled={!canPause} onClick={pausePlayback}>
      Pause
    </button>
  );
}
