import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { usePatternList } from "@/atoms/pattern-management";
import {
  useSequenceList,
  useAddToSequence,
  useRemoveFromSequence,
  useDuplicateInSequence,
  useSwapInSequence,
  useReorderSequence,
  type SequenceEntry,
} from "@/atoms/sequence";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  GripVerticalIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  CopyIcon,
  Trash2Icon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PatternSequence() {
  const patterns = usePatternList();
  const sequence = useSequenceList();
  const addToSequence = useAddToSequence();
  const reorderSequence = useReorderSequence();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortableIds = sequence.map((_, i) => String(i));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = Number(active.id);
    const newIndex = Number(over.id);
    const newOrder = arrayMove(
      sequence.map((e) => e.patternId),
      oldIndex,
      newIndex,
    );
    reorderSequence(newOrder);
  }

  const canDelete = sequence.length > 1;

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold font-mono">
          Pattern Sequence
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Add to sequence">
              <PlusIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {patterns.map((pattern) => (
              <DropdownMenuItem
                key={pattern.id}
                onSelect={() => addToSequence(pattern.id)}
              >
                {pattern.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <ScrollArea className="max-h-40 overflow-auto border">
            <ol className="space-y-0.5">
              {sequence.map((entry) => (
                <SortableSequenceRow
                  key={entry.index}
                  entry={entry}
                  isFirst={entry.index === 0}
                  isLast={entry.index === sequence.length - 1}
                  canDelete={canDelete}
                />
              ))}
            </ol>
          </ScrollArea>
        </SortableContext>
      </DndContext>
    </div>
  );
}

type SortableSequenceRowProps = {
  entry: SequenceEntry;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
};

function SortableSequenceRow({
  entry,
  isFirst,
  isLast,
  canDelete,
}: SortableSequenceRowProps) {
  const removeFromSequence = useRemoveFromSequence();
  const duplicateInSequence = useDuplicateInSequence();
  const swapInSequence = useSwapInSequence();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(entry.index) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-1 rounded-md px-2 py-1 bg-background ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>

      <span className="flex-1 truncate text-xs font-mono">
        {entry.index + 1}. {entry.name}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Actions for sequence entry ${entry.index + 1}`}
          >
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-fit">
          <DropdownMenuItem
            onSelect={() =>
              swapInSequence({ index: entry.index, direction: "up" })
            }
            disabled={isFirst}
          >
            <ArrowUpIcon />
            Swap with previous
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              swapInSequence({ index: entry.index, direction: "down" })
            }
            disabled={isLast}
          >
            <ArrowDownIcon />
            Swap with next
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => duplicateInSequence(entry.index)}>
            <CopyIcon />
            Duplicate in sequence
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => removeFromSequence(entry.index)}
            disabled={!canDelete}
          >
            <Trash2Icon />
            Remove from sequence
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
