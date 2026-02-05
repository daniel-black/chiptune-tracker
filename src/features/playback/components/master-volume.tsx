import { Slider } from "@/components/ui/slider";
import { useMasterVolume } from "../atoms/master-volume";
import { Label } from "@/components/ui/label";

export function MasterVolume() {
  const [volume, setVolume] = useMasterVolume();

  return (
    <div className="flex gap-1.5 items-center no-wrap">
      <Label htmlFor="volume" className="text-sm">
        VOL
      </Label>
      <Slider
        min={0}
        max={100}
        value={[volume]}
        onValueChange={([value]) => setVolume(value)}
        id="volume"
        name="volume"
        className="min-w-40"
      />
      <span className="tabular-nums text-xs font-mono w-10 text-left text-muted-foreground">
        {volume}%
      </span>
    </div>
  );
}
