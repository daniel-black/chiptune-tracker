import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useResetPlaybackRange } from "@/features/playback/atoms/range";
import { ListChevronsUpDownIcon } from "lucide-react";

export function ResetRangeButton() {
  const { canReset, reset } = useResetPlaybackRange();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          disabled={!canReset}
          onClick={reset}
          className="w-full h-10 border-none"
        >
          <ListChevronsUpDownIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-2">
        <span>Reset the playback range</span>
        <Kbd>R</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
