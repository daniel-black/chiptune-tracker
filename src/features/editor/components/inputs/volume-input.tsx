import { useState } from "react";
import { isVolumeLevel } from "../../../../audio/volume";
import type { Cell } from "../../../../types";
import { TextInput } from "./text-input";
import { padNumber } from "../../../../utils/format";

type VolumeInputProps = {
  volume: Cell["volume"];
  setVolume: (volume: Cell["volume"]) => void;
};

export function VolumeInput({ volume, setVolume }: VolumeInputProps) {
  // Local state for holding value during editing
  const [localVolume, setLocalVolume] = useState<string>(
    volume !== "--" ? padNumber(volume) : volume,
  );

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    const valueNum = Number(value);

    if (isVolumeLevel(valueNum)) {
      setVolume(valueNum);
      setLocalVolume(value); // don't pad local input (if needed) until blur
      return;
    }
  }

  function handleBlur() {
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
    <TextInput
      editorInputType="volume"
      value={localVolume}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={2}
    />
  );
}
