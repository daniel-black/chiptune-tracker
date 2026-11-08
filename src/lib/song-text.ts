/**
 * A plain-text song format that people and chatbots can read and write.
 * The app stores songs as full grids; this format is sparse (only rows where
 * something happens are written) so it stays short and hard to miscount.
 *
 *   chiptunes 1
 *   title: Boss Approach
 *   bpm: 84
 *
 *   pattern Intro
 *   # row  ch1 (note duty vol) | ch2 | ch3 | noise (rate vol)
 *   00  D-5 12 03 | .         | D-2 50 07 | 03 07
 *   12  OFF -- -- | A-4 25 03 | .         | 22 04
 *
 *   order: Intro, Intro
 *
 * The full description for chatbots lives in public/llms.txt; keep the two in
 * step when the format changes.
 */
import { CHANNEL_CONFIG } from "@/audio/channel-config";
import { defaultBpm, maxBpm, minBpm, rows as ROWS } from "@/audio/constants";
import { isDuty } from "@/audio/characteristics/duty";
import { isMusicalNote, type MusicalNote } from "@/audio/characteristics/notes";
import type { VolumeLevel } from "@/audio/characteristics/volume";
import type { Rate } from "@/audio/characteristics/rate";
import { createDefaultPattern } from "@/models/factory";
import type { NoiseCell } from "@/models/noise-cell";
import type { PulseCell } from "@/models/pulse-cell";
import type { Cell, NamedPattern } from "@/models/song";
import type { SharedSong } from "./share";

export const SONG_TEXT_VERSION = 1;
const MAX_PATTERNS = 64;
const MAX_ORDER = 256;
const MAX_ERRORS = 6;

/** Thrown with every problem found, each naming its line */
export class SongTextError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(problems.join("\n"));
    this.name = "SongTextError";
    this.problems = problems;
  }
}

// --- Reading ----------------------------------------------------------------

/** Parse song text. Throws SongTextError listing what's wrong, by line. */
export function songFromText(text: string): SharedSong {
  const problems: string[] = [];
  const fail = (line: number, message: string) => {
    if (problems.length < MAX_ERRORS) problems.push(`Line ${line}: ${message}`);
  };

  let name = "";
  let bpm: number = defaultBpm;
  let order: Array<{ name: string; line: number }> | null = null;
  const patterns: Array<{ name: string; line: number; data: Cell[][]; seen: Set<number> }> = [];

  text.split(/\r?\n/).forEach((raw, i) => {
    const lineNo = i + 1;
    // "#" starts a comment only on its own ("C#4" is a note, not a comment)
    const line = raw.replace(/(^|\s)#(\s.*)?$/, "").trim();
    if (!line) return;

    let match: RegExpMatchArray | null;
    if ((match = line.match(/^chiptunes\s+(\S+)$/i))) {
      if (match[1] !== String(SONG_TEXT_VERSION)) {
        fail(lineNo, `this is format version ${match[1]}, but only version ${SONG_TEXT_VERSION} is supported`);
      }
    } else if ((match = line.match(/^(?:title|name)\s*:\s*(.*)$/i))) {
      name = match[1].trim().slice(0, 300);
    } else if ((match = line.match(/^bpm\s*:\s*(.*)$/i))) {
      const value = Number(match[1]);
      if (!Number.isInteger(value) || value < minBpm || value > maxBpm) {
        fail(lineNo, `bpm must be a whole number from ${minBpm} to ${maxBpm}, not "${match[1]}"`);
      } else {
        bpm = value;
      }
    } else if ((match = line.match(/^pattern(?:\s*:\s*|\s+|$)(.*)$/i))) {
      const patternName = match[1].trim();
      if (!patternName) fail(lineNo, `give the pattern a name, like "pattern Intro"`);
      else if (patterns.some((p) => p.name.toLowerCase() === patternName.toLowerCase())) {
        fail(lineNo, `there's already a pattern called "${patternName}"`);
      } else if (patterns.length >= MAX_PATTERNS) {
        fail(lineNo, `a song can have at most ${MAX_PATTERNS} patterns`);
      } else {
        patterns.push({ name: patternName, line: lineNo, data: createDefaultPattern(), seen: new Set() });
      }
    } else if ((match = line.match(/^order\s*:\s*(.*)$/i))) {
      // Comma-separated, so pattern names can contain spaces
      const parts = match[1].includes(",") ? match[1].split(",") : match[1].split(/\s+/);
      order = parts.map((part) => ({ name: part.trim(), line: lineNo })).filter((p) => p.name);
    } else if (/^\d/.test(line)) {
      const pattern = patterns[patterns.length - 1];
      if (!pattern) {
        fail(lineNo, `rows must come after a "pattern" line`);
        return;
      }
      parseRow(line, lineNo, pattern, fail);
    } else {
      fail(lineNo, `couldn't understand "${truncate(line)}"`);
    }
  });

  if (patterns.length === 0) {
    problems.push(`The song needs at least one pattern, starting with a line like "pattern Intro"`);
  }

  const ids = new Map(patterns.map((p) => [p.name.toLowerCase(), crypto.randomUUID()]));
  const orderNames = order ?? patterns.map((p) => ({ name: p.name, line: p.line }));
  if (orderNames.length === 0) problems.push(`"order" lists no patterns`);
  if (orderNames.length > MAX_ORDER) problems.push(`"order" can list at most ${MAX_ORDER} entries`);
  const patternOrder: string[] = [];
  for (const entry of orderNames) {
    const id = ids.get(entry.name.toLowerCase());
    if (id) patternOrder.push(id);
    else fail(entry.line, `"order" mentions "${entry.name}", but there's no pattern with that name`);
  }

  if (problems.length > 0) throw new SongTextError(problems);

  const namedPatterns: Record<string, NamedPattern> = {};
  for (const p of patterns) {
    const id = ids.get(p.name.toLowerCase())!;
    namedPatterns[id] = { id, name: p.name, data: p.data };
  }
  return { name, bpm, patterns: namedPatterns, patternOrder };
}

function parseRow(
  line: string,
  lineNo: number,
  pattern: { data: Cell[][]; seen: Set<number> },
  fail: (line: number, message: string) => void,
) {
  // Pipes are optional decoration; values are separated by spaces
  const tokens = line.replace(/\|/g, " ").split(/\s+/).filter(Boolean);
  const rowToken = tokens.shift()!;
  const row = Number(rowToken);
  if (!/^\d{1,2}$/.test(rowToken) || row >= ROWS) {
    fail(lineNo, `row numbers go from 00 to ${ROWS - 1}, not "${rowToken}"`);
    return;
  }
  if (pattern.seen.has(row)) {
    fail(lineNo, `row ${pad(row)} appears twice in this pattern`);
    return;
  }
  pattern.seen.add(row);

  for (let c = 0; c < CHANNEL_CONFIG.length; c++) {
    const { kind, name } = CHANNEL_CONFIG[c];
    if (tokens.length === 0) break; // channels left off the end are empty
    if (tokens[0] === ".") {
      tokens.shift();
      continue;
    }
    const fieldCount = kind === "pulse" ? 3 : 2;
    const fields = tokens.splice(0, fieldCount);
    if (fields.length < fieldCount || fields.includes(".")) {
      fail(
        lineNo,
        kind === "pulse"
          ? `${name} needs three values (note duty volume, e.g. "C-4 50 08") or "." for nothing`
          : `${name} needs two values (rate volume, e.g. "05 08") or "." for nothing`,
      );
      return;
    }
    const cell =
      kind === "pulse"
        ? parsePulse(fields, lineNo, name, fail)
        : parseNoise(fields, lineNo, name, fail);
    if (cell) pattern.data[row][c] = cell;
  }
  if (tokens.length > 0) {
    fail(lineNo, `there are extra values at the end: "${truncate(tokens.join(" "))}"`);
  }
}

const isEmpty = (token: string) => /^-{1,3}$/.test(token);

function parsePulse(
  [noteToken, dutyToken, volumeToken]: string[],
  lineNo: number,
  channel: string,
  fail: (line: number, message: string) => void,
): PulseCell | null {
  const note = parseNote(noteToken);
  const duty = isEmpty(dutyToken) ? "--" : dutyToken;
  const volume = parseVolume(volumeToken);
  let ok = true;
  if (note === null) {
    fail(lineNo, `${channel}: "${noteToken}" isn't a note. Use a pitch, accidental and octave 2–7 like C-4, F#3 or Bb5, or OFF, or ---`);
    ok = false;
  }
  if (!(duty === "--" || isDuty(duty))) {
    fail(lineNo, `${channel}: duty must be 12, 25, 50, 75 or --, not "${dutyToken}"`);
    ok = false;
  }
  if (volume === null) {
    fail(lineNo, `${channel}: volume must be 0 to 15 or --, not "${volumeToken}"`);
    ok = false;
  }
  if (!ok) return null;
  return { kind: "pulse", note: note!, duty: duty as PulseCell["duty"], volume: volume! };
}

function parseNoise(
  [rateToken, volumeToken]: string[],
  lineNo: number,
  channel: string,
  fail: (line: number, message: string) => void,
): NoiseCell | null {
  const rate = isEmpty(rateToken) ? "--" : /^\d{1,2}$/.test(rateToken) ? pad(Number(rateToken)) : null;
  const volume = parseVolume(volumeToken);
  let ok = true;
  if (rate === null) {
    fail(lineNo, `${channel}: rate must be 00 to 99 or --, not "${rateToken}"`);
    ok = false;
  }
  if (volume === null) {
    fail(lineNo, `${channel}: volume must be 0 to 15 or --, not "${volumeToken}"`);
    ok = false;
  }
  if (!ok) return null;
  return { kind: "noise", rate: rate as Rate | "--", volume: volume! };
}

/** "c4" -> "C-4", "f#3" -> "F#3", "BB5" -> "Bb5", "off" -> "OFF" */
function parseNote(token: string): PulseCell["note"] | null {
  if (isEmpty(token)) return "---";
  if (/^off$/i.test(token)) return "OFF";
  const match = token.match(/^([a-g])([-#b]?)([2-7])$/i);
  if (!match) return null;
  const note = `${match[1].toUpperCase()}${match[2] || "-"}${match[3]}`;
  return isMusicalNote(note) ? (note as MusicalNote) : null;
}

function parseVolume(token: string): Cell["volume"] | null {
  if (isEmpty(token)) return "--";
  if (!/^\d{1,2}$/.test(token)) return null;
  const value = Number(token);
  return value <= 15 ? (value as VolumeLevel) : null;
}

// --- Writing ----------------------------------------------------------------

/** Write a song as text. Only rows with something in them are included. */
export function songToText(song: SharedSong): string {
  const lines = [
    `chiptunes ${SONG_TEXT_VERSION}`,
    `title: ${song.name}`,
    `bpm: ${song.bpm}`,
  ];

  // Patterns in the order they're first used, then any unused ones
  const ids = [...new Set([...song.patternOrder, ...Object.keys(song.patterns)])];
  const names = new Map<string, string>();
  for (const id of ids) {
    const pattern = song.patterns[id];
    if (!pattern) continue;
    names.set(id, uniqueName(pattern.name || "Untitled pattern", names));

    lines.push("", `pattern ${names.get(id)}`);
    lines.push(`# row  ch1 (note duty vol) | ch2 | ch3 | noise (rate vol)`);
    pattern.data.forEach((cells, row) => {
      if (cells.every(isEmptyCell)) return;
      const columns = cells.map((cell) => (isEmptyCell(cell) ? "." : formatCell(cell)));
      // Trailing empty channels can be left off
      while (columns.length > 1 && columns[columns.length - 1] === ".") columns.pop();
      lines.push(`${pad(row)}  ${columns.map((col, c) => col.padEnd(c < 3 ? 9 : 0)).join(" | ").trimEnd()}`);
    });
  }

  lines.push("", `order: ${song.patternOrder.map((id) => names.get(id)).join(", ")}`);
  return `${lines.join("\n")}\n`;
}

function isEmptyCell(cell: Cell): boolean {
  return cell.kind === "pulse"
    ? cell.note === "---" && cell.duty === "--" && cell.volume === "--"
    : cell.rate === "--" && cell.volume === "--";
}

function formatCell(cell: Cell): string {
  const volume = cell.volume === "--" ? "--" : pad(cell.volume);
  return cell.kind === "pulse"
    ? `${cell.note} ${cell.duty} ${volume}`
    : `${cell.rate} ${volume}`;
}

/** Pattern names must be unique (case-insensitively) to be referenced in order */
function uniqueName(base: string, taken: Map<string, string>): string {
  const used = new Set([...taken.values()].map((n) => n.toLowerCase()));
  // Commas separate entries in "order", so they can't be part of a name
  const clean = base.replace(/,/g, " ").replace(/\s+/g, " ").trim() || "Untitled pattern";
  let candidate = clean;
  for (let n = 2; used.has(candidate.toLowerCase()); n++) candidate = `${clean} ${n}`;
  return candidate;
}

// --- Links --------------------------------------------------------------------

/**
 * The link form of the text: line breaks become ";" and spaces become "_",
 * so chat apps don't break the link. Percent-encoded text also works.
 */
export function songTextFromLinkPayload(payload: string): string {
  let text = payload;
  try {
    text = decodeURIComponent(payload);
  } catch {
    // Not percent-encoded; use as is
  }
  return text.replace(/;/g, "\n").replace(/_/g, " ");
}

export function songTextToLinkPayload(text: string): string {
  return text
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    // Pipes are optional, so drop them rather than encode them
    .map((line) => line.replace(/\|/g, " ").trim().replace(/\s+/g, "_"))
    .join(";");
}

// --- Helpers ----------------------------------------------------------------

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function truncate(text: string, max = 40): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}
