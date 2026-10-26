import { ButtonGroup } from "@/components/ui/button-group";
import { Bpm } from "@/features/playback/components/bpm";
import { Loop } from "@/features/playback/components/loop";
import { MasterVolume } from "@/features/playback/components/master-volume";
import { Pause } from "@/features/playback/components/pause";
import { Start } from "@/features/playback/components/start";
import { Stop } from "@/features/playback/components/stop";
import { UndoRedo } from "./undo-redo";

export function PanelControls() {
  return (
    <div className="h-10 border-b w-full flex items-center gap-4 px-4">
      <ButtonGroup>
        <Start />
        <Stop />
        <Pause />
      </ButtonGroup>

      <Loop />

      <UndoRedo />

      <div className="flex-1">
        <MasterVolume />
      </div>

      <Bpm />
    </div>
  );
}
