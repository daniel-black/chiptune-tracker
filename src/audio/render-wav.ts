import type { Song } from "@/models/song";
import { CHANNEL_CONFIG } from "./channel-config";
import type { Channel } from "./channels/channel";
import { NoiseChannel } from "./channels/noise-channel";
import { PulseChannel } from "./channels/pulse-channel";
import { synthesizeCell } from "./synthesis";

const SAMPLE_RATE = 44100;
const ROWS_PER_BEAT = 4;
/** Room after the last row so its note isn't cut off mid-wave */
const TAIL_SECONDS = 0.25;
/** Exports are normalized so their loudest moment sits just under full scale */
const PEAK_TARGET = 0.89; // about -1 dBFS
/** Never boost a near-silent song by more than this */
const MAX_GAIN = 8;

export type RenderedSong = { blob: Blob; seconds: number };

/**
 * Renders a song to a mono 16-bit WAV, playing the arrangement once from the
 * top. Uses the same channels as live playback, in an OfflineAudioContext
 * that runs as fast as the CPU allows. Mute buttons, loop and the playback
 * range are deliberately ignored: the export is always the whole song.
 */
export async function renderSongToWav(song: Song): Promise<RenderedSong> {
  const secondsPerRow = 60 / (song.bpm * ROWS_PER_BEAT);
  const rows = song.patternOrder.flatMap(
    (id) => song.patterns[id]?.data ?? [],
  );
  const songSeconds = rows.length * secondsPerRow;
  const totalSeconds = songSeconds + TAIL_SECONDS;

  const ctx = new OfflineAudioContext(
    1,
    Math.ceil(totalSeconds * SAMPLE_RATE),
    SAMPLE_RATE,
  );
  const master = new GainNode(ctx, { gain: 1 });
  master.connect(ctx.destination);

  const channels: Channel[] = CHANNEL_CONFIG.map((ch) =>
    ch.kind === "pulse"
      ? new PulseChannel(ctx, master)
      : new NoiseChannel(ctx, master),
  );
  channels.forEach((channel) => channel.start());

  rows.forEach((row, i) => {
    const time = i * secondsPerRow;
    row.forEach((cell, c) => channels[c]?.scheduleCell(synthesizeCell(cell), time));
  });
  channels.forEach((channel) => channel.silence(songSeconds));

  const buffer = await ctx.startRendering();
  const samples = buffer.getChannelData(0);
  normalize(samples);

  return {
    blob: encodeWav(samples, SAMPLE_RATE),
    seconds: songSeconds,
  };
}

/** Scale so the loudest sample hits PEAK_TARGET (in place) */
function normalize(samples: Float32Array): void {
  let peak = 0;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  if (peak === 0) return;

  const gain = Math.min(PEAK_TARGET / peak, MAX_GAIN);
  for (let i = 0; i < samples.length; i++) samples[i] *= gain;
}

/** Mono 16-bit PCM WAV: a 44-byte RIFF header followed by the samples */
function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const view = new DataView(new ArrayBuffer(44 + dataSize));

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const s of samples) {
    const clamped = Math.max(-1, Math.min(1, s));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += bytesPerSample;
  }

  return new Blob([view], { type: "audio/wav" });
}
