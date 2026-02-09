import { Checkbox } from "@/components/ui/checkbox";
import { useLoop } from "../atoms/loop";
import { Label } from "@/components/ui/label";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Loop() {
  const [loop, setLoop] = useLoop();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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
      </TooltipTrigger>
      <TooltipContent>
        Toggle loop <Kbd>Ctrl</Kbd> + <Kbd>L</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
