// Note names per semitone, starting at C. Sharps and flats share a pitch.
const semitoneNames = [
  ["C-"],
  ["C#", "Db"],
  ["D-"],
  ["D#", "Eb"],
  ["E-"],
  ["F-"],
  ["F#", "Gb"],
  ["G-"],
  ["G#", "Ab"],
  ["A-"],
  ["A#", "Bb"],
  ["B-"],
] as const;

const octaves = [2, 3, 4, 5, 6, 7] as const;

type NoteName = (typeof semitoneNames)[number][number];

export type MusicalNote = `${NoteName}${(typeof octaves)[number]}`;

// Equal temperament relative to A4 = 440 Hz
const noteEntries = octaves.flatMap((octave) =>
  semitoneNames.flatMap((names, semitone) => {
    const semitonesFromA4 = (octave - 4) * 12 + (semitone - 9);
    const frequency = 440 * 2 ** (semitonesFromA4 / 12);
    return names.map(
      (name) => [`${name}${octave}` as MusicalNote, frequency] as const,
    );
  }),
);

export function isMusicalNote(note: string): note is MusicalNote {
  return noteFrequencyMap.has(note as MusicalNote);
}

const noteFrequencyMap = new Map<MusicalNote, number>(noteEntries);

export function getNoteFrequency(note: string): number {
  if (note === "---") {
    return -1;
  }

  if (note === "OFF") {
    return 0;
  }

  if (!isMusicalNote(note)) {
    throw new Error(`Invalid note (${note}) passed to getNotFrequency`);
  }

  const frequency = noteFrequencyMap.get(note);

  if (frequency === undefined) {
    throw new Error(`Invalid note (${note}) passed to getNotFrequency`);
  }

  return frequency;
}
