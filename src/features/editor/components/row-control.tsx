import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  setEndOfPlaybackRangeAtom,
  setStartOfPlaybackRangeAtom,
  useCanRowBeEndOfRange,
  useCanRowBeStartOfRange,
} from "@/features/playback/atoms/range";
import { padNumberTwoDigit } from "@/utils/format";
import { useSetAtom } from "jotai";

/** Bar starts (every 16 rows) get the accent, beats (every 4) stand out a bit */
function rowNumberColor(rowIndex: number) {
  if (rowIndex % 16 === 0) return "text-primary";
  if (rowIndex % 4 === 0) return "text-foreground/80";
  return "text-muted-foreground/60";
}

export function RowControl({ rowIndex }: { rowIndex: number }) {
  const canBeStart = useCanRowBeStartOfRange(rowIndex);
  const setStartOfPlaybackRange = useSetAtom(setStartOfPlaybackRangeAtom);

  const canBeEnd = useCanRowBeEndOfRange(rowIndex);
  const setEndOfPlaybackRange = useSetAtom(setEndOfPlaybackRangeAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-6 w-10 font-mono text-[11px] tabular-nums focus-visible:ring-0 hover:cursor-context-menu ${rowNumberColor(rowIndex)}`}
        >
          {padNumberTwoDigit(rowIndex)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Row {rowIndex + 1}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setStartOfPlaybackRange(rowIndex)}
            disabled={!canBeStart}
          >
            Set as start
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setEndOfPlaybackRange(rowIndex)}
            disabled={!canBeEnd}
          >
            Set as end
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
