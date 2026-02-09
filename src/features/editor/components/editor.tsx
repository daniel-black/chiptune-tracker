import { useAtom, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";
import {
  togglePlaybackAtom,
  stopPlaybackAtom,
} from "@/features/playback/atoms/playback";
import { loopAtom } from "@/features/playback/atoms/loop";

export function Editor({ children }: { children: React.ReactNode }) {
  const togglePlayback = useSetAtom(togglePlaybackAtom);
  const stopPlayback = useSetAtom(stopPlaybackAtom);
  const [loop, setLoop] = useAtom(loopAtom);

  useHotkeys("ctrl+Space", () => togglePlayback());
  useHotkeys("ctrl+e", () => stopPlayback());
  useHotkeys("ctrl+l", () => setLoop(!loop));

  return (
    <div className="h-dvh min-w-fit w-fit overflow-auto">
      <table className="border-separate border-spacing-0">{children}</table>
    </div>
  );
}
