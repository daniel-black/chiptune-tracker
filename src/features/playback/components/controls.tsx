import { Bpm } from "./bpm";
import { Loop } from "./loop";
import { Pause } from "./pause";
import { Start } from "./start";
import { Stop } from "./stop";

export function Controls() {
  return (
    <div className="p-2 border space-y-2">
      <div className="flex gap-1">
        <Start />
        <Stop />
        <Pause />
      </div>

      <div className="flex justify-between">
        <Bpm />
        <Loop />
      </div>
    </div>
  );
}
