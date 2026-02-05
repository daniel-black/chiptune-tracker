import { useAtomValue, useSetAtom } from "jotai";
import { canStartPlaybackAtom, startPlaybackAtom } from "../../atoms/playback";

export function Start() {
  const canStart = useAtomValue(canStartPlaybackAtom);
  const startPlayback = useSetAtom(startPlaybackAtom);

  return (
    <button disabled={!canStart} onClick={startPlayback}>
      Start
    </button>
  );
}
