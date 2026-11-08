import { useState } from "react";
import { useAtomValue } from "jotai";
import { ChevronDownIcon, RotateCcwIcon } from "lucide-react";
import {
  demoStatusesAtom,
  useRestoreDemoSong,
  type DemoStatus,
} from "@/atoms/song";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Song } from "@/models/song";

const statusLabel: Record<DemoStatus, string> = {
  missing: "Deleted",
  modified: "Edited",
  original: "Unchanged",
};

/** Brings back a demo song that was deleted or edited beyond repair */
export function RestoreDemoButton() {
  const demos = useAtomValue(demoStatusesAtom);
  const restore = useRestoreDemoSong();
  const [confirming, setConfirming] = useState<Song | null>(null);

  function handleSelect(demo: Song, status: DemoStatus) {
    // Only an edited demo has anything to lose
    if (status === "modified") {
      setConfirming(demo);
    } else {
      restore(demo.id);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <RotateCcwIcon />
            Restore a demo song
            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-56">
          <DropdownMenuLabel>Reset to how it shipped</DropdownMenuLabel>
          {demos.map(({ demo, status }) => (
            <DropdownMenuItem
              key={demo.id}
              disabled={status === "original"}
              onSelect={() => handleSelect(demo, status)}
              className="justify-between gap-4"
            >
              <span>{demo.name}</span>
              <span className="text-muted-foreground">
                {statusLabel[status]}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={confirming !== null}
        onOpenChange={(open) => !open && setConfirming(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore "{confirming?.name}"?</DialogTitle>
            <DialogDescription>
              It will go back to how it was originally, and any changes you've
              made to it will be lost. Your other songs won't be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirming) restore(confirming.id);
                setConfirming(null);
              }}
            >
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
