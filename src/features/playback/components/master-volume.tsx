import { useMasterVolume } from "../atoms/master-volume";

export function MasterVolume() {
  const [volume, setVolume] = useMasterVolume();

  return (
    <div className="flex gap-1 items-center no-wrap">
      <label htmlFor="volume">VOL:</label>
      <input
        type="range"
        id="volume"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => setVolume(e.target.valueAsNumber)}
      />
      <span className="tabular-nums font-mono w-10 text-left">{volume}%</span>
    </div>
  );
}
