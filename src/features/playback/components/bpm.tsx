import { Input } from "@/components/ui/input";
import { useBpm } from "../atoms/bpm";
import { Label } from "@/components/ui/label";

export function Bpm() {
  const [bpm, setBpm] = useBpm();

  return (
    <div className="flex gap-1.5 items-center no-wrap">
      <Label htmlFor="bpm" className="text-sm">
        BPM
      </Label>
      <Input
        className="font-mono tabular-nums w-16"
        type="number"
        value={bpm}
        onChange={(e) => setBpm(e.target.valueAsNumber)}
        min={60}
        max={300}
        id="bpm"
        name="bpm"
      />
    </div>
  );
}
