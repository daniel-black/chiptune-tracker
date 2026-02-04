import { useState } from "react";
import { isVolumeLevel } from "../../../audio/volume";
import type { Cell } from "../../../types";

type VolumeInputProps = {
  volume: Cell["volume"];
  setVolume: (volume: Cell["volume"]) => void;
};

export function VolumeInput({ volume, setVolume }: VolumeInputProps) {
  // Local state for holding value during editing
  const [localVolume, setLocalVolume] = useState<string>(
    volume !== "--" ? padNumber(volume) : volume,
  );

  function handleLocalVolumeKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    // shortcut for entering a continue symbol
    if (e.key === "-") {
      setVolume("--");
      setLocalVolume("--");
      return;
    }

    if (localVolume === "--") {
      if (e.key === "Backspace") {
        setLocalVolume(""); // fully clear local input when backspacing a continue
        return;
      }

      if (isVolumeLevel(parseInt(e.key, 10))) {
        // clear the input so that onChange can write w/o running into maxLength restriction
        setLocalVolume("");
        return;
      }
    }
  }

  // come back and validate the shit out of this later
  function handleLocalVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    const valueNum = Number(value);

    if (isVolumeLevel(valueNum)) {
      setVolume(valueNum);
      setLocalVolume(value); // don't pad local input (if needed) until blur
      return;
    }
  }

  function handleLocalVolumeBlur() {
    const parsedLocalVolume = parseInt(localVolume, 10);

    if (isVolumeLevel(parsedLocalVolume)) {
      if (volume !== parsedLocalVolume) {
        setVolume(parsedLocalVolume);
      }
      setLocalVolume(padNumber(parsedLocalVolume));
      return;
    }

    setVolume("--");
    setLocalVolume("--");
  }

  return (
    <input
      type="text"
      value={localVolume}
      onKeyDown={handleLocalVolumeKeyDown}
      onChange={handleLocalVolumeChange}
      onBlur={handleLocalVolumeBlur}
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
