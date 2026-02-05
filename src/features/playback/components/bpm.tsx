import { useBpm } from "../atoms/bpm";

export function Bpm() {
  const [bpm, setBpm] = useBpm();

  return (
    <div className="flex gap-1 items-center no-wrap">
      <label htmlFor="bpm">BPM:</label>
      <input
        className="font-mono tabular-nums"
        type="number"
        value={bpm}
        onChange={(e) => setBpm(e.target.valueAsNumber)}
        min={60}
        max={300}
        id="bpm"
      />
    </div>
  );
}
