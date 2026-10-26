import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useBpm } from "../atoms/bpm";
import { Label } from "@/components/ui/label";
import { maxBpm, minBpm } from "@/audio/constants";

export function Bpm() {
  const [bpm, setBpm] = useBpm();
  // Local text so intermediate values (e.g. "1" on the way to "150", or "")
  // never reach the scheduler; only in-range values are committed.
  const [localBpm, setLocalBpm] = useState(String(bpm));
  const [prevBpm, setPrevBpm] = useState(bpm);
  if (prevBpm !== bpm) {
    setPrevBpm(bpm);
    setLocalBpm(String(bpm));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLocalBpm(e.target.value);

    const value = e.target.valueAsNumber;
    if (Number.isInteger(value) && value >= minBpm && value <= maxBpm) {
      setBpm(value);
    }
  }

  function handleBlur() {
    setLocalBpm(String(bpm));
  }

  return (
    <div className="flex gap-1.5 items-center no-wrap">
      <Label htmlFor="bpm" className="text-sm">
        BPM
      </Label>
      <Input
        className="font-mono tabular-nums w-16"
        type="number"
        value={localBpm}
        onChange={handleChange}
        onBlur={handleBlur}
        min={minBpm}
        max={maxBpm}
        id="bpm"
        name="bpm"
      />
    </div>
  );
}
