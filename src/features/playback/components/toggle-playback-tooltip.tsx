import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TogglePlaybackTooltip({
  type,
  children,
}: {
  type: "Play" | "Pause";
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        {type} <Kbd>Space</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
