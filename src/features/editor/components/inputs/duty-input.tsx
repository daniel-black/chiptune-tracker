import { useState } from "react";
import { isDuty } from "@/audio/characteristics/duty";
import { TextInput } from "./text-input";
import type { PulseCell } from "@/models/pulse-cell";


function isValidFirstLetterForDuty(value: string) {
  return /^[1257-]$/.test(value);
}

const dutyShortCutMap = new Map<string, PulseCell["duty"]>([
  ["1", "12"],
  ["2", "25"],
  ["5", "50"],
  ["7", "75"],
  ["-", "--"],
]);

type DutyInputProps = {
  duty: PulseCell["duty"];
  setDuty: (duty: PulseCell["duty"]) => void;
};

export function DutyInput({ duty, setDuty }: DutyInputProps) {
  const [localDuty, setLocalDuty] = useState<string>(duty);

  // Key down can handle the setting logic for Duty input since values are few and distinct
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key.length === 1 && isValidFirstLetterForDuty(e.key)) {
      const dutyFromShortCut = dutyShortCutMap.get(e.key);
      if (dutyFromShortCut) {
        setDuty(dutyFromShortCut);
        setLocalDuty(dutyFromShortCut);
        return;
      }
    }

    if (localDuty.length === 2) {
      if (e.key === "Backspace") {
        setLocalDuty("");
        return;
      }
    }
  }

  // Since we can easily shortcut to the right value in keyDown, we don't need onChange to do work
  // Keeping onChange around though so that I don't get console errors about an uncontrolled component etc.
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    console.log(`Duty input ignored value: ${e.target.value}`);
  }

  function handleBlur() {
    if (!isDuty(localDuty)) {
      setDuty("--");
      setLocalDuty("--");
    }
  }

  return (
    <TextInput
      editorInputType="duty"
      field={1}
      value={localDuty}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={2}
    />
  );
}
