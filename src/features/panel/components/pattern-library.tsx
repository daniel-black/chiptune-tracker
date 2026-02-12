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
import { Label } from "@/components/ui/label";
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

  const canDelete = patterns.length > 1;
  const deleteTargetName =
    patterns.find((p) => p.id === deleteTargetId)?.name ?? "";

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
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold font-mono">
          Pattern Library
        </Label>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => createPattern()}
          aria-label="New pattern"
        >
          <PlusIcon />
        </Button>
      </div>

      <ScrollArea className="max-h-40 overflow-auto border">
        <ul className="space-y-0.5">
          {patterns.map((p) => (
            <PatternRow
              key={p.id}
              pattern={p}
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
              Are you sure you want to delete "{deleteTargetName}"? This action
              cannot be undone.
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
    </div>
  );
}

type PatternRowProps = {
  pattern: NamedPattern;
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
      className={`flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer transition-colors ${
        isSelected ? "bg-accent" : "hover:bg-muted"
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
          className="h-5 text-xs py-0"
        />
      ) : (
        <span className="flex-1 truncate text-xs font-mono">
          {pattern.name}
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
