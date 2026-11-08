import { CHANNEL_CONFIG } from "@/audio/channel-config";
import { defaultBpm, maxBpm, minBpm, rows } from "@/audio/constants";
import { isDuty } from "@/audio/characteristics/duty";
import { isMusicalNote } from "@/audio/characteristics/notes";
import { isVolumeLevel } from "@/audio/characteristics/volume";
import type { Cell, NamedPattern, Song } from "@/models/song";
import { songFromText, songTextFromLinkPayload } from "./song-text";

/**
 * Songs are shared as `#v1.<base64url(deflate-raw(JSON))>` in the URL hash.
 * The hash never reaches the server, so the song stays out of request logs.
 * Bump the version prefix if the payload format ever changes, and keep
 * decoding old versions so existing links keep working.
 */
const VERSION = "v1";
/** Prefix for links that carry the song as readable text */
const TEXT_VERSION = "t1";
const MAX_TEXT_LINK_CHARS = 200_000;

/** The part of a song that travels in a share link */
export type SharedSong = Pick<Song, "name" | "patterns" | "patternOrder" | "bpm">;

/** Cap on decompressed size so a crafted link can't exhaust memory */
const MAX_DECODED_BYTES = 5_000_000;

export async function encodeSong(song: Song): Promise<string> {
  const payload: SharedSong = {
    name: song.name,
    patterns: song.patterns,
    patternOrder: song.patternOrder,
    bpm: song.bpm,
  };
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const compressed = await pipe(json, new CompressionStream("deflate-raw"));
  return `${VERSION}.${toBase64Url(compressed)}`;
}

/** Throws if the string isn't a valid share payload */
export async function decodeSong(encoded: string): Promise<SharedSong> {
  const dot = encoded.indexOf(".");
  const version = dot === -1 ? "" : encoded.slice(0, dot);

  // Readable text links, e.g. written by a chatbot (see song-text.ts)
  if (version === TEXT_VERSION) {
    const payload = encoded.slice(dot + 1);
    if (payload.length > MAX_TEXT_LINK_CHARS) {
      throw new Error("Share link payload is too large");
    }
    return songFromText(songTextFromLinkPayload(payload));
  }

  if (version !== VERSION) {
    throw new Error(`Unsupported share link version: ${version || "none"}`);
  }

  const compressed = fromBase64Url(encoded.slice(dot + 1));
  const json = await pipe(
    compressed,
    new DecompressionStream("deflate-raw"),
    MAX_DECODED_BYTES,
  );
  const parsed: unknown = JSON.parse(new TextDecoder().decode(json));

  if (!isSharedSong(parsed)) {
    throw new Error("Share link contains an invalid song");
  }
  // Links made before tempo was saved per song have no bpm
  return { ...parsed, bpm: parsed.bpm ?? defaultBpm };
}

export async function buildShareUrl(song: Song): Promise<string> {
  const url = new URL("/share", window.location.origin);
  url.hash = await encodeSong(song);
  return url.toString();
}

async function pipe(
  input: Uint8Array,
  transform: CompressionStream | DecompressionStream,
  maxBytes = Infinity,
): Promise<Uint8Array> {
  const reader = new Blob([input as BlobPart])
    .stream()
    .pipeThrough(transform)
    .getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("Share link payload is too large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

// --- Validation: share links are untrusted input ---

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isVolume(value: unknown): boolean {
  return value === "--" || (typeof value === "number" && isVolumeLevel(value));
}

function isCell(value: unknown, kind: "pulse" | "noise"): value is Cell {
  if (!isRecord(value) || value.kind !== kind || !isVolume(value.volume)) {
    return false;
  }
  if (kind === "pulse") {
    const { note, duty } = value;
    return (
      typeof note === "string" &&
      (note === "---" || note === "OFF" || isMusicalNote(note)) &&
      typeof duty === "string" &&
      (duty === "--" || isDuty(duty))
    );
  }
  return (
    typeof value.rate === "string" &&
    (value.rate === "--" || /^\d\d$/.test(value.rate))
  );
}

function isNamedPattern(value: unknown, id: string): value is NamedPattern {
  if (!isRecord(value) || value.id !== id || typeof value.name !== "string") {
    return false;
  }
  const { data } = value;
  return (
    Array.isArray(data) &&
    data.length === rows &&
    data.every(
      (row) =>
        Array.isArray(row) &&
        row.length === CHANNEL_CONFIG.length &&
        row.every((cell, i) => isCell(cell, CHANNEL_CONFIG[i].kind)),
    )
  );
}

function isBpm(value: unknown): boolean {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= minBpm &&
    value <= maxBpm
  );
}

function isSharedSong(
  value: unknown,
): value is Omit<SharedSong, "bpm"> & { bpm?: number } {
  if (!isRecord(value) || typeof value.name !== "string") return false;
  if (value.bpm !== undefined && !isBpm(value.bpm)) return false;

  const { patterns, patternOrder } = value;
  if (!isRecord(patterns) || !Array.isArray(patternOrder)) return false;

  return (
    Object.entries(patterns).every(([id, p]) => isNamedPattern(p, id)) &&
    patternOrder.every((id) => typeof id === "string" && Object.hasOwn(patterns, id))
  );
}
