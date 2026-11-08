import { useRef, useState } from "react";
import { useCurrentPatternId } from "@/atoms/song";
import {
  usePatternList,
  useSwitchPattern,
  useCreatePattern,
  useDuplicatePattern,
  useRenamePattern,
  useDeletePattern,
} from "@/atoms/pattern-management";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePatternUsage } from "@/atoms/sequence";
import { PanelSection } from "./panel-section";
import {
  CopyIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import type { NamedPattern } from "@/models/song";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PatternLibrary() {
  const patterns = usePatternList();
  const currentPatternId = useCurrentPatternId();
  const switchPattern = useSwitchPattern();
  const createPattern = useCreatePattern();
  const duplicatePattern = useDuplicatePattern();
  const renamePattern = useRenamePattern();
  const deletePattern = useDeletePattern();

  const [renamingPatternId, setRenamingPatternId] = useState<string | null>(
    null,
  );
  const [renameValue, setRenameValue] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const usage = usePatternUsage();
  const canDelete = patterns.length > 1;
  const deleteTargetName =
    patterns.find((p) => p.id === deleteTargetId)?.name || "Untitled pattern";
  const deleteTargetUses = deleteTargetId ? (usage[deleteTargetId] ?? 0) : 0;

  function startRename(pattern: NamedPattern) {
    setRenamingPatternId(pattern.id);
    setRenameValue(pattern.name);
  }

  function commitRename() {
    if (renamingPatternId) {
      renamePattern({ patternId: renamingPatternId, name: renameValue });
    }
    setRenamingPatternId(null);
  }

  function cancelRename(pattern: NamedPattern) {
    setRenameValue(pattern.name);
    setRenamingPatternId(null);
  }

  function handleConfirmDelete() {
    if (deleteTargetId) {
      deletePattern(deleteTargetId);
    }
    setDeleteTargetId(null);
  }

  return (
    <PanelSection
      title="Patterns"
      action={
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => createPattern()}
        >
          <PlusIcon />
          New
        </Button>
      }
    >
      <ScrollArea className="max-h-72 overflow-auto rounded-md border bg-secondary/60 p-1">
        <ul className="space-y-0.5">
          {patterns.map((p) => (
            <PatternRow
              key={p.id}
              pattern={p}
              uses={usage[p.id] ?? 0}
              isSelected={p.id === currentPatternId}
              isRenaming={p.id === renamingPatternId}
              renameValue={renameValue}
              canDelete={canDelete}
              onSelect={() => switchPattern(p.id)}
              onRenameValueChange={setRenameValue}
              onStartRename={() => startRename(p)}
              onCommitRename={commitRename}
              onCancelRename={() => cancelRename(p)}
              onDuplicate={() => duplicatePattern(p.id)}
              onDelete={() => setDeleteTargetId(p.id)}
            />
          ))}
        </ul>
      </ScrollArea>

      <Dialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete pattern</DialogTitle>
            <DialogDescription>
              Delete "{deleteTargetName}"?
              {deleteTargetUses > 0 &&
                ` It will also be removed from the arrangement, where it appears ${
                  deleteTargetUses === 1 ? "once" : `${deleteTargetUses} times`
                }.`}{" "}
              You can undo this with Ctrl + Z.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PanelSection>
  );
}

type PatternRowProps = {
  pattern: NamedPattern;
  uses: number;
  isSelected: boolean;
  isRenaming: boolean;
  renameValue: string;
  canDelete: boolean;
  onSelect: () => void;
  onRenameValueChange: (value: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

function PatternRow({
  pattern,
  uses,
  isSelected,
  isRenaming,
  renameValue,
  canDelete,
  onSelect,
  onRenameValueChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDuplicate,
  onDelete,
}: PatternRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleRenameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      onCommitRename();
    } else if (e.key === "Escape") {
      onCancelRename();
    }
  }

  return (
    <li
      role="button"
      onClick={onSelect}
      aria-current={isSelected ? "true" : undefined}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer transition-colors ${
        isSelected
          ? "bg-primary/15 text-primary shadow-[inset_2px_0_0_var(--color-primary)]"
          : "hover:bg-muted"
      }`}
    >
      {isRenaming ? (
        <Input
          ref={inputRef}
          autoFocus={true}
          value={renameValue}
          onChange={(e) => onRenameValueChange(e.target.value)}
          onBlur={onCommitRename}
          onKeyDown={handleRenameKeyDown}
          onClick={(e) => e.stopPropagation()}
          maxLength={100}
          spellCheck={false}
          className="h-6 text-sm py-0 px-1.5"
        />
      ) : (
        <span className="flex-1 truncate text-sm">
          {pattern.name || "Untitled pattern"}
        </span>
      )}

      {!isRenaming && (
        <span
          className={`shrink-0 text-[11px] tabular-nums ${
            isSelected ? "text-primary/80" : "text-muted-foreground"
          }`}
        >
          {isSelected && "Editing · "}
          {uses === 0 ? "Unused" : `${uses}×`}
        </span>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Actions for ${pattern.name}`}
          >
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onStartRename}>
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicate}>
            <CopyIcon />
            Duplicate
          </DropdownMenuItem>
          {canDelete && (
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
}
