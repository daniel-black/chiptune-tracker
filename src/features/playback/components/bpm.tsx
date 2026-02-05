import { useAtom } from "jotai";
import { bpmAtom } from "../atoms/playback";

export function Bpm() {
  const [bpm, setBpm] = useAtom(bpmAtom);

  return (
    <input
      type="number"
      value={bpm}
      onChange={(e) => setBpm(e.target.valueAsNumber)}
      min={60}
      max={300}
    />
  );
}
