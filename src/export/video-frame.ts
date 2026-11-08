import { CHANNEL_CONFIG } from "@/audio/channel-config";
import { isMusicalNote } from "@/audio/characteristics/notes";
import type { Cell, Song } from "@/models/song";

/** Square plays well in every feed (X, Instagram, Reddit, TikTok) */
export const VIDEO_SIZE = 1080;
const ROWS_PER_BEAT = 4;

// Same palette as the app (see the tokens in index.css)
const color = {
  bg: "#0d0e12",
  panel: "#15161c",
  border: "#26272f",
  primary: "#f0a531",
  text: "#f4f2ec",
  muted: "#9a99a5",
  note: "#f4f2ec",
  duty: "#7cc4ea",
  volume: "#84d6a0",
  rate: "#c6a2ee",
  empty: "#3a3b45",
  rowNumber: "#5d5e69",
  beatNumber: "#d6d5dc",
};

const SANS = '"Inter Variable", system-ui, sans-serif';
const MONO = '"JetBrains Mono Variable", ui-monospace, monospace';

/** The fonts the canvas draws with must be loaded before the first frame */
export async function loadVideoFonts(): Promise<void> {
  await Promise.all([
    document.fonts.load(`800 60px ${SANS}`),
    document.fonts.load(`500 28px ${SANS}`),
    document.fonts.load(`600 24px ${MONO}`),
  ]);
}

/** One row of the song, flattened across the arrangement */
type TimelineRow = {
  seq: number;
  patternName: string;
  rowInPattern: number;
  cells: Cell[];
  /** How loud each channel is on this row, 0–1, for the meters */
  levels: number[];
  /** Channels where a new note starts on this row */
  hits: boolean[];
};

export type VideoTimeline = {
  song: Song;
  rows: TimelineRow[];
  secondsPerRow: number;
  songSeconds: number;
};

export function buildTimeline(song: Song): VideoTimeline {
  const secondsPerRow = 60 / (song.bpm * ROWS_PER_BEAT);
  const rows: TimelineRow[] = [];

  // Volume and note on/off carry over from row to row, like the synth
  const volume = CHANNEL_CONFIG.map(() => 0);
  const gateOpen = CHANNEL_CONFIG.map(() => true);

  song.patternOrder.forEach((id, seq) => {
    const pattern = song.patterns[id];
    if (!pattern) return;
    pattern.data.forEach((cells, rowInPattern) => {
      const hits = cells.map(() => false);
      const levels = cells.map((cell, c) => {
        if (cell.volume !== "--") volume[c] = cell.volume;
        if (cell.kind === "pulse") {
          if (cell.note === "OFF") gateOpen[c] = false;
          if (isMusicalNote(cell.note)) {
            gateOpen[c] = true;
            hits[c] = true;
          }
          return gateOpen[c] ? volume[c] / 15 : 0;
        }
        // Old songs silence noise with a frozen rate of 00
        if (cell.rate === "00") return 0;
        if (cell.volume !== "--" && cell.volume > 0) hits[c] = true;
        return volume[c] / 15;
      });
      rows.push({ seq, patternName: pattern.name, rowInPattern, cells, levels, hits });
    });
  });

  return {
    song,
    rows,
    secondsPerRow,
    songSeconds: rows.length * secondsPerRow,
  };
}

/** Meter values carried between frames so they fall smoothly */
export type MeterState = number[];

export function createMeterState(): MeterState {
  return CHANNEL_CONFIG.map(() => 0);
}

// --- Layout ---------------------------------------------------------------

const PAD = 64;
const PANEL = { x: PAD, y: 236, w: VIDEO_SIZE - PAD * 2, h: 668 };
const HEADER_H = 76;
const ROW_H = 44;
const NUMBER_COL_W = 92;
const COL_W = { pulse: 236, noise: 152 };
const ROWS_TOP = PANEL.y + HEADER_H;
const ROWS_BOTTOM = PANEL.y + PANEL.h - 12;
const PLAYHEAD_Y = Math.round((ROWS_TOP + ROWS_BOTTOM) / 2 - ROW_H / 2);

const columns = (() => {
  let x = PANEL.x + NUMBER_COL_W;
  return CHANNEL_CONFIG.map((ch) => {
    const col = { x, w: COL_W[ch.kind], kind: ch.kind, name: ch.name };
    x += col.w;
    return col;
  });
})();

// --- Drawing --------------------------------------------------------------

/** Draws the frame for `time` seconds into the song */
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  timeline: VideoTimeline,
  time: number,
  meters: MeterState,
): void {
  const { rows, secondsPerRow, songSeconds, song } = timeline;
  const position = Math.min(time / secondsPerRow, rows.length - 0.001);
  const current = rows[Math.max(0, Math.floor(position))];

  ctx.fillStyle = color.bg;
  ctx.fillRect(0, 0, VIDEO_SIZE, VIDEO_SIZE);

  drawHeader(ctx, song, current?.patternName ?? "");
  drawPanel(ctx, timeline, position, current, meters, time >= songSeconds);
  drawFooter(ctx, time, songSeconds, timeline);
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  song: Song,
  patternName: string,
) {
  // Logo: four amber bars, as in the app icon
  ctx.fillStyle = color.primary;
  [20, 34, 26, 42].forEach((h, i) => ctx.fillRect(PAD + i * 18, 106 - h, 12, h));

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color.text;
  ctx.font = `800 60px ${SANS}`;
  ctx.fillText(fit(ctx, song.name || "Untitled song", PANEL.w), PAD, 172);

  ctx.fillStyle = color.muted;
  ctx.font = `500 28px ${SANS}`;
  ctx.fillText(
    fit(ctx, `${song.bpm} BPM · ${patternName || "Untitled pattern"}`, PANEL.w),
    PAD,
    212,
  );
}

function drawPanel(
  ctx: CanvasRenderingContext2D,
  timeline: VideoTimeline,
  position: number,
  current: TimelineRow | undefined,
  meters: MeterState,
  finished: boolean,
) {
  const { rows } = timeline;

  roundRect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 24);
  ctx.fillStyle = color.panel;
  ctx.fill();
  ctx.strokeStyle = color.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Channel names and level meters
  columns.forEach((col, c) => {
    ctx.fillStyle = color.beatNumber;
    ctx.font = `600 22px ${SANS}`;
    ctx.fillText(col.name, col.x + 22, PANEL.y + 38);

    // Meters jump up on a new note and fall back smoothly
    const target = finished ? 0 : (current?.levels[c] ?? 0);
    const hit = !finished && current?.hits[c] && position % 1 < 0.35;
    meters[c] = Math.max(target * (hit ? 1 : 0.85), meters[c] * 0.86);

    const meterW = col.w - 44;
    roundRect(ctx, col.x + 22, PANEL.y + 52, meterW, 6, 3);
    ctx.fillStyle = color.border;
    ctx.fill();
    if (meters[c] > 0.01) {
      roundRect(ctx, col.x + 22, PANEL.y + 52, Math.max(6, meterW * meters[c]), 6, 3);
      ctx.fillStyle = color.primary;
      ctx.fill();
    }
  });

  ctx.fillStyle = color.border;
  ctx.fillRect(PANEL.x, ROWS_TOP - 2, PANEL.w, 2);
  columns.forEach((col) => ctx.fillRect(col.x, PANEL.y + 16, 2, PANEL.h - 28));

  // Rows scroll upward past a fixed playhead
  ctx.save();
  ctx.beginPath();
  ctx.rect(PANEL.x, ROWS_TOP, PANEL.w, ROWS_BOTTOM - ROWS_TOP);
  ctx.clip();

  const first = Math.floor(position) - 8;
  const last = Math.floor(position) + 8;
  for (let i = first; i <= last; i++) {
    const row = rows[i];
    if (!row) continue;
    const y = PLAYHEAD_Y + (i - position) * ROW_H;

    if (row.rowInPattern % 4 === 0) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(PANEL.x, y, PANEL.w, ROW_H);
    }
    if (row.rowInPattern === 0 && i > 0) {
      ctx.fillStyle = color.primary;
      ctx.fillRect(PANEL.x, y - 1, PANEL.w, 2);
    }
  }

  // Playhead under the text so the notes stay crisp
  ctx.fillStyle = "rgba(240,165,49,0.22)";
  ctx.fillRect(PANEL.x, PLAYHEAD_Y, PANEL.w, ROW_H);
  ctx.fillStyle = color.primary;
  ctx.fillRect(PANEL.x, PLAYHEAD_Y, 5, ROW_H);

  ctx.textBaseline = "middle";
  for (let i = first; i <= last; i++) {
    const row = rows[i];
    if (!row) continue;
    const y = PLAYHEAD_Y + (i - position) * ROW_H + ROW_H / 2;
    drawRow(ctx, row, y, i === Math.floor(position));
  }
  ctx.restore();

  // Fade rows out toward the top and bottom edges
  const fade = 110;
  for (const [y0, y1] of [
    [ROWS_TOP, ROWS_TOP + fade],
    [ROWS_BOTTOM, ROWS_BOTTOM - fade],
  ]) {
    const gradient = ctx.createLinearGradient(0, y0, 0, y1);
    gradient.addColorStop(0, "rgba(21,22,28,1)");
    gradient.addColorStop(1, "rgba(21,22,28,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(PANEL.x + 2, Math.min(y0, y1), PANEL.w - 4, fade);
  }
  ctx.textBaseline = "alphabetic";
}

function drawRow(
  ctx: CanvasRenderingContext2D,
  row: TimelineRow,
  y: number,
  isPlaying: boolean,
) {
  const n = row.rowInPattern;
  ctx.font = `${isPlaying ? 700 : 500} 22px ${MONO}`;
  ctx.fillStyle = isPlaying
    ? color.text
    : n % 16 === 0
      ? color.primary
      : n % 4 === 0
        ? color.beatNumber
        : color.rowNumber;
  ctx.fillText(String(n).padStart(2, "0"), PANEL.x + 30, y);

  row.cells.forEach((cell, c) => {
    const x = columns[c].x + 26;
    const fields: Array<[string, string]> =
      cell.kind === "pulse"
        ? [
            [cell.note, color.note],
            [cell.duty, color.duty],
            [formatVolume(cell.volume), color.volume],
          ]
        : [
            [cell.rate, color.rate],
            [formatVolume(cell.volume), color.volume],
          ];

    let fx = x;
    fields.forEach(([text, fieldColor], f) => {
      const empty = text === "---" || text === "--";
      ctx.font = `${f === 0 && cell.kind === "pulse" && !empty ? 700 : 500} 24px ${MONO}`;
      ctx.fillStyle = empty ? color.empty : fieldColor;
      ctx.fillText(text, fx, y);
      fx += ctx.measureText(f === 0 && cell.kind === "pulse" ? "C-4" : "00").width + 22;
    });
  });
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  time: number,
  songSeconds: number,
  timeline: VideoTimeline,
) {
  const barY = 948;
  const progress = Math.min(1, time / songSeconds);

  roundRect(ctx, PAD, barY, PANEL.w, 8, 4);
  ctx.fillStyle = color.border;
  ctx.fill();
  if (progress > 0) {
    roundRect(ctx, PAD, barY, Math.max(8, PANEL.w * progress), 8, 4);
    ctx.fillStyle = color.primary;
    ctx.fill();
  }

  // Ticks where each arrangement entry starts
  const rowsPerEntry = timeline.rows.length / timeline.song.patternOrder.length;
  ctx.fillStyle = color.bg;
  for (let seq = 1; seq < timeline.song.patternOrder.length; seq++) {
    const x = PAD + (PANEL.w * seq * rowsPerEntry) / timeline.rows.length;
    ctx.fillRect(x - 1, barY, 3, 8);
  }

  ctx.font = `500 26px ${MONO}`;
  ctx.fillStyle = color.muted;
  ctx.fillText(`${clock(time)} / ${clock(songSeconds)}`, PAD, 1008);

  ctx.font = `700 28px ${SANS}`;
  ctx.fillStyle = color.primary;
  const site = "chiptunes.studio";
  ctx.fillText(site, VIDEO_SIZE - PAD - ctx.measureText(site).width, 1008);
}

// --- Helpers --------------------------------------------------------------

function formatVolume(volume: Cell["volume"]): string {
  return volume === "--" ? "--" : String(volume).padStart(2, "0");
}

function clock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Shorten text with an ellipsis until it fits `maxWidth` */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) end--;
  return `${text.slice(0, end)}…`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
