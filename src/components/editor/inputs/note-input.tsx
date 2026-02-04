import { useState } from "react";
import type { PulseCell } from "../../../types";
import { isMusicalNote } from "../../../audio/notes";

function isValidPitch(value: string): boolean {
  return /^[a-g]$/i.test(value);
}

function canBeSharp(pitch: string): boolean {
  return ["A", "C", "D", "F", "G"].includes(pitch.toUpperCase());
}

function canBeFlat(pitch: string): boolean {
  return ["A", "B", "D", "E", "G"].includes(pitch.toUpperCase());
}

type NoteInputProps = {
  note: PulseCell["note"];
  setNote: (note: PulseCell["note"]) => void;
};

export function NoteInput({ note, setNote }: NoteInputProps) {
  const [localNote, setLocalNote] = useState<string>(note);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (localNote.length === 3 && isValidPitch(e.key)) {
      setLocalNote(""); // Clear input
      return;
    }

    if (e.key === "Backspace" && (localNote === "---" || localNote === "OFF")) {
      setLocalNote(""); // Backspace clears whole input if cont. or off
      return;
    }

    if (e.key === "o") {
      console.log("shortcutting OFF");
      setNote("OFF");
      setLocalNote("OFF");
      return;
    }

    if (localNote.length !== 1 && e.key === "-") {
      console.log("shortcutting continue");
      setNote("---");
      setLocalNote("---");
      return;
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();

    if (value === "") {
      setLocalNote("");
      return;
    }

    if (value.length === 1 && isValidPitch(value)) {
      setLocalNote(value.toUpperCase());
      return;
    }

    if (value.length === 2 && isValidPitch(value[0])) {
      const pitch = value[0].toUpperCase();
      const middleChar = value[1].toLowerCase();

      if (
        middleChar === "-" ||
        (middleChar === "#" && canBeSharp(pitch)) ||
        (middleChar === "b" && canBeFlat(pitch))
      ) {
        setLocalNote(value);
        return;
      }
    }

    if (value.length === 3 && isMusicalNote(value)) {
      setNote(value);
      setLocalNote(value);
    }
  }

  function handleBlur() {
    if (localNote.length !== 3) {
      setNote("---");
      setLocalNote("---");
    }
  }

  return (
    <input
      type="text"
      value={localNote}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-8 text-sm text-center font-mono"
      maxLength={3}
      spellCheck={false}
    />
  );
}
