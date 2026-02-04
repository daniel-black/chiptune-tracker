import { useState } from "react";
import type { PulseCell } from "../../../types";
import { continueLong, off } from "../../../constants";
import { isMusicalNote } from "../../../audio/notes";

type NoteInputProps = {
  note: PulseCell["note"];
  setNote: (note: PulseCell["note"]) => void;
};

export function NoteInput({ note, setNote }: NoteInputProps) {
  const [localNote, setLocalNote] = useState<string>(note);

  function handleLocalNoteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.trim();
    setLocalNote(value);

    if (value.length === 3) {
      if (value === off) {
        setNote(off);
        return;
      }

      if (value === continueLong) {
        setNote(continueLong);
        return;
      }

      if (isMusicalNote(value)) {
        setNote(value);
        return;
      }
    }
  }

  return (
    <input
      type="text"
      value={localNote}
      onChange={handleLocalNoteChange}
      className="w-6 text-sm text-center font-mono"
      maxLength={3}
      spellCheck={false}
    />
  );
}
