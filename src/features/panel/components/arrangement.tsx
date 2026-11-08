import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAtomValue } from "jotai";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CopyIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { usePatternList } from "@/atoms/pattern-management";
import {
  useSequenceList,
  useAddToSequence,
  useRemoveFromSequence,
  useDuplicateInSequence,
  useSwapInSequence,
  useMoveInSequence,
  useSelectedSequenceIndex,
  useSelectSequenceEntry,
  type SequenceEntry,
} from "@/atoms/sequence";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSequencePosition } from "@/features/playback/atoms/sequence-position";
import { playbackStatusAtom } from "@/features/playback/atoms/playback";
import { PanelSection } from "./panel-section";

/**
 * The order patterns play in, as a row of chips that wraps like a timeline.
 * Click a chip to edit it (playback starts there); drag to reorder.
 */
export function Arrangement() {
  const patterns = usePatternList();
  const sequence = useSequenceList();
  const addToSequence = useAddToSequence();
  const moveInSequence = useMoveInSequence();
  const selectedIndex = useSelectedSequenceIndex();
  const sequencePosition = useSequencePosition();
  const isPlaying = useAtomValue(playbackStatusAtom) !== "stopped";

  // Mouse drags after a small move so clicks still select; touch needs a
  // long press so the panel can still scroll.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    moveInSequence({ from: Number(active.id), to: Number(over.id) });
  }

  return (
    <PanelSection
      title="Arrangement"
      action={
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <PlusIcon />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Add to the end</DropdownMenuLabel>
            {patterns.map((pattern) => (
              <DropdownMenuItem
                key={pattern.id}
                onSelect={() => addToSequence(pattern.id)}
              >
                {pattern.name || "Untitled pattern"}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sequence.map((_, i) => String(i))}
          strategy={rectSortingStrategy}
        >
          <ol className="flex flex-wrap gap-1.5">
            {sequence.map((entry) => (
              <ArrangementChip
                key={entry.index}
                entry={entry}
                isFirst={entry.index === 0}
                isLast={entry.index === sequence.length - 1}
                canRemove={sequence.length > 1}
                isPlaying={isPlaying && entry.index === sequencePosition}
                isSelected={entry.index === selectedIndex}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </PanelSection>
  );
}

type ArrangementChipProps = {
  entry: SequenceEntry;
  isFirst: boolean;
  isLast: boolean;
  canRemove: boolean;
  isPlaying: boolean;
  isSelected: boolean;
};

function ArrangementChip({
  entry,
  isFirst,
  isLast,
  canRemove,
  isPlaying,
  isSelected,
}: ArrangementChipProps) {
  const selectEntry = useSelectSequenceEntry();
  const removeFromSequence = useRemoveFromSequence();
  const duplicateInSequence = useDuplicateInSequence();
  const swapInSequence = useSwapInSequence();

  // Only pointer listeners: the chip's own buttons handle keyboard use, and
  // reordering by keyboard goes through the menu.
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: String(entry.index) });

  const number = String(entry.index + 1).padStart(2, "0");
  const name = entry.name || "Untitled pattern";

  const stateClass = isPlaying
    ? "bg-primary text-primary-foreground border-primary"
    : isSelected
      ? "bg-primary/10 text-primary border-primary/60"
      : "bg-secondary text-foreground border-border hover:bg-muted";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...listeners}
      className={`group flex items-center h-8 rounded-md border transition-colors ${stateClass} ${
        isDragging ? "z-10 opacity-60 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => selectEntry(entry.index)}
        aria-current={isSelected ? "true" : undefined}
        aria-label={`Edit entry ${entry.index + 1}: ${name}`}
        className="flex items-center gap-1.5 h-full pl-2 pr-1 rounded-l-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className={`font-mono text-[11px] tabular-nums ${
            isPlaying ? "opacity-70" : "text-muted-foreground"
          }`}
        >
          {number}
        </span>
        <span className="max-w-36 truncate text-sm">{name}</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Options for entry ${entry.index + 1}`}
            className="h-full px-1 rounded-r-md opacity-60 hover:opacity-100 focus-visible:opacity-100 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronDownIcon className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-fit">
          <DropdownMenuItem
            onSelect={() =>
              swapInSequence({ index: entry.index, direction: "up" })
            }
            disabled={isFirst}
          >
            <ArrowLeftIcon />
            Move earlier
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              swapInSequence({ index: entry.index, direction: "down" })
            }
            disabled={isLast}
          >
            <ArrowRightIcon />
            Move later
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicateInSequence(entry.index)}>
            <CopyIcon />
            Repeat
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => removeFromSequence(entry.index)}
            disabled={!canRemove}
          >
            <Trash2Icon />
            Remove from arrangement
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
