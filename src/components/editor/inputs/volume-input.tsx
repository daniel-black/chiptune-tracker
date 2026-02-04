import { useState } from "react";
import { continueShort } from "../../../constants";
import { isVolumeLevel } from "../../../audio/volume";
import type { Cell } from "../../../types";

type VolumeInputProps = {
  volume: Cell["volume"];
  setVolume: (volume: Cell["volume"]) => void;
};

export function VolumeInput({ volume, setVolume }: VolumeInputProps) {
  // Local state for holding value during editing
  const [localVolume, setLocalVolume] = useState<string>(
    volume !== continueShort ? padNumber(volume) : volume,
  );

  // come back and validate the shit out of this later
  function handleLocalVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("onChange");
    const value = e.target.value;
    setLocalVolume(value);

    if (value.length === 2) {
      if (value === continueShort) {
        setVolume(value);
        return;
      }

      const parsedValue = parseInt(value, 10);
      if (isVolumeLevel(parsedValue)) {
        setVolume(parsedValue);
      }
    }
  }

  return (
    <input
      type="text"
      value={localVolume}
      onChange={handleLocalVolumeChange}
      className="w-6 text-sm text-center font-mono"
      maxLength={2}
      spellCheck={false}
    />
  );
}

function padNumber(num: number): string {
  if (num < 10) return `0${num}`;
  return num.toString();
}
