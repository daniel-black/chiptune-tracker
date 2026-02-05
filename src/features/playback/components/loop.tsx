import { Checkbox } from "@/components/ui/checkbox";
import { useLoop } from "../atoms/loop";
import { Label } from "@/components/ui/label";

export function Loop() {
  const [loop, setLoop] = useLoop();

  return (
    <div className="flex items-center gap-1.5 no-wrap">
      <Checkbox
        id="loop"
        name="loop"
        checked={loop}
        onCheckedChange={() => setLoop(!loop)}
      />
      <Label htmlFor="loop" className="text-sm">
        LOOP
      </Label>
    </div>
  );
}
