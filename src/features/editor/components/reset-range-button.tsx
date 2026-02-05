import { Button } from "@/components/ui/button";
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
      <TooltipContent side="right">Reset the playback range</TooltipContent>
    </Tooltip>
  );
}
