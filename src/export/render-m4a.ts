import {
  AudioBufferSource,
  BufferTarget,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  canEncodeAudio,
} from "mediabunny";
import { renderSongAudio } from "@/audio/render-wav";
import type { Song } from "@/models/song";

/** AAC encoding is missing in some Firefox versions */
export async function canRenderM4a(): Promise<boolean> {
  try {
    return await canEncodeAudio("aac", { numberOfChannels: 1, sampleRate: 44100 });
  } catch {
    return false;
  }
}

/**
 * Renders the song as AAC audio in an MP4 container (.m4a): the same audio
 * as the WAV export at around a tenth of the size.
 */
export async function renderSongToM4a(
  song: Song,
): Promise<{ blob: Blob; seconds: number }> {
  const { buffer, seconds } = await renderSongAudio(song);

  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });
  const audioSource = new AudioBufferSource({
    codec: "aac",
    bitrate: QUALITY_HIGH,
  });
  output.addAudioTrack(audioSource);

  try {
    await output.start();
    await audioSource.add(buffer);
    audioSource.close();
    await output.finalize();
  } catch (err) {
    await output.cancel().catch(() => {});
    throw err;
  }

  const data = output.target.buffer;
  if (!data) throw new Error("Audio encoding produced no data");
  return { blob: new Blob([data], { type: "audio/mp4" }), seconds };
}
