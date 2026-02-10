import { useState } from "react";
import { TextInput } from "./text-input";
import { isMusicalNote, type MusicalNote } from "@/audio/characteristics/notes";
import type { PulseCell } from "@/models/pulse-cell";
import { advanceDown } from "../../utils/navigation";

function isValidPitch(value: string): boolean {
  return /^[a-g]$/i.test(value);
}

function isValidOctave(value: string): boolean {
  return /[2-7]/.test(value);
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
      setNote("OFF");
      setLocalNote("OFF");
      advanceDown();
      return;
    }

    if (localNote.length !== 1 && e.key === "-") {
      setNote("---");
      setLocalNote("---");
      advanceDown();
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
      const secondChar = value[1].toLowerCase();

      // If the user types "D4", shortcut it to "D-4"
      if (isValidOctave(secondChar)) {
        const newNote = `${pitch}-${secondChar}` as MusicalNote;
        setNote(newNote);
        setLocalNote(newNote);
        advanceDown();
        return;
      }

      if (
        secondChar === "-" ||
        (secondChar === "#" && canBeSharp(pitch)) ||
        (secondChar === "b" && canBeFlat(pitch))
      ) {
        setLocalNote(value);
        return;
      }
    }

    if (value.length === 3 && isMusicalNote(value)) {
      setNote(value);
      setLocalNote(value);
      advanceDown();
    }
  }

  function handleBlur() {
    if (localNote.length !== 3) {
      setNote("---");
      setLocalNote("---");
    }
  }

  return (
    <TextInput
      editorInputType="note"
      field={0}
      value={localNote}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      maxLength={3}
    />
  );
}
