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
import { padNumber } from "@/utils/format";
import { useSetAtom } from "jotai";

export function RowControl({ rowIndex }: { rowIndex: number }) {
  const canBeStart = useCanRowBeStartOfRange(rowIndex);
  const setStartOfPlaybackRange = useSetAtom(setStartOfPlaybackRangeAtom);

  const canBeEnd = useCanRowBeEndOfRange(rowIndex);
  const setEndOfPlaybackRange = useSetAtom(setEndOfPlaybackRangeAtom);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-none w-10 focus-visible:ring-0 hover:cursor-context-menu"
        >
          {padNumber(rowIndex + 1)}
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
