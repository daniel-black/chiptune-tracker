import { ButtonGroup } from "@/components/ui/button-group";
import { Bpm } from "./bpm";
import { Loop } from "./loop";
import { MasterVolume } from "./master-volume";
import { Pause } from "./pause";
import { Start } from "./start";
import { Stop } from "./stop";

export function Controls() {
  return (
    <div className="p-2 border space-y-2">
      <ButtonGroup>
        <Start />
        <Stop />
        <Pause />
      </ButtonGroup>

      <Loop />
      <Bpm />
      <MasterVolume />
    </div>
  );
}
