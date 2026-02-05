import { useAtom } from "jotai";
import { loopAtom } from "../../atoms/playback";

export function Loop() {
  const [loop, setLoop] = useAtom(loopAtom);

  return (
    <button onClick={() => setLoop(!loop)}>
      {loop ? "looping" : "not looping"}
    </button>
  );
}
