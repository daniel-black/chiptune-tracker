import { useAtomValue, useSetAtom } from "jotai";
import { canStartPlaybackAtom, startPlaybackAtom } from "../atoms/playback";

export function Start() {
  const canStart = useAtomValue(canStartPlaybackAtom);
  const startPlayback = useSetAtom(startPlaybackAtom);

  return (
    <button
      className="px-2 border disabled:text-gray-500"
      disabled={!canStart}
      onClick={startPlayback}
    >
      START
    </button>
  );
}
