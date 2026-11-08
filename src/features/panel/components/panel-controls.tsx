import { ButtonGroup } from "@/components/ui/button-group";
import { Bpm } from "@/features/playback/components/bpm";
import { Loop } from "@/features/playback/components/loop";
import { MasterVolume } from "@/features/playback/components/master-volume";
import { Pause } from "@/features/playback/components/pause";
import { Start } from "@/features/playback/components/start";
import { Stop } from "@/features/playback/components/stop";
import { UndoRedo } from "./undo-redo";

/**
 * Playback and editing on the left, song tempo and listening volume on the
 * right. Wraps onto a second line when space runs out.
 */
export function PanelControls() {
  return (
    <div className="min-h-10 shrink-0 border-b w-full flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-1.5 sm:px-4 bg-background">
      <div className="flex items-center gap-4">
        <ButtonGroup>
          <Start />
          <Stop />
          <Pause />
        </ButtonGroup>
        <Loop />
        <UndoRedo />
      </div>

      {/* BPM sits first and the volume slider takes whatever width is left,
          so this group reads left-to-right whether or not it wraps. */}
      <div className="flex flex-1 min-w-60 items-center gap-4">
        <Bpm />
        <div className="flex-1">
          <MasterVolume />
        </div>
      </div>
    </div>
  );
}
