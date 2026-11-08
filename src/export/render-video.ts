import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  canEncodeAudio,
  canEncodeVideo,
} from "mediabunny";
import { renderSongAudio } from "@/audio/render-wav";
import type { Song } from "@/models/song";
import {
  VIDEO_SIZE,
  buildTimeline,
  createMeterState,
  drawFrame,
  loadVideoFonts,
} from "./video-frame";

const FPS = 30;

/**
 * Social apps (and iPhones) expect H.264 video with AAC audio in an MP4.
 * Firefox can't always encode those, so check before offering the export.
 */
export async function canRenderVideo(): Promise<boolean> {
  try {
    const [video, audio] = await Promise.all([
      canEncodeVideo("avc", {
        width: VIDEO_SIZE,
        height: VIDEO_SIZE,
        frameRate: FPS,
      }),
      canEncodeAudio("aac", { numberOfChannels: 1, sampleRate: 44100 }),
    ]);
    return video && audio;
  } catch {
    return false;
  }
}

export type RenderVideoOptions = {
  /** Called with progress from 0 to 1 */
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
};

/**
 * Renders a square MP4 of the song: the tracker grid scrolling under a
 * playhead, with the song as its soundtrack. Frames are drawn to a canvas and
 * encoded as fast as the browser allows, not in real time.
 */
export async function renderSongToMp4(
  song: Song,
  { onProgress, signal }: RenderVideoOptions = {},
): Promise<{ blob: Blob; seconds: number }> {
  const [{ buffer: audio, seconds }] = await Promise.all([
    renderSongAudio(song),
    loadVideoFonts(),
  ]);
  throwIfAborted(signal);

  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_SIZE;
  canvas.height = VIDEO_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");

  const output = new Output({
    // Index at the front so the file can start playing before it's fully loaded
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target: new BufferTarget(),
  });
  const videoSource = new CanvasSource(canvas, {
    codec: "avc",
    bitrate: QUALITY_HIGH,
  });
  const audioSource = new AudioBufferSource({
    codec: "aac",
    bitrate: QUALITY_HIGH,
  });
  output.addVideoTrack(videoSource, { frameRate: FPS });
  output.addAudioTrack(audioSource);

  try {
    await output.start();

    // Audio is already rendered; let it encode alongside the frames
    const audioDone = audioSource.add(audio).then(() => audioSource.close());

    const timeline = buildTimeline(song);
    const meters = createMeterState();
    const totalFrames = Math.ceil(audio.duration * FPS);

    for (let frame = 0; frame < totalFrames; frame++) {
      throwIfAborted(signal);
      const time = frame / FPS;
      drawFrame(ctx, timeline, time, meters);
      await videoSource.add(time, 1 / FPS);
      if (frame % 10 === 0) onProgress?.(frame / totalFrames);
    }
    videoSource.close();
    await audioDone;

    await output.finalize();
    onProgress?.(1);
  } catch (err) {
    await output.cancel().catch(() => {});
    throw err;
  }

  const data = output.target.buffer;
  if (!data) throw new Error("Video encoding produced no data");
  return { blob: new Blob([data], { type: "video/mp4" }), seconds };
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Export cancelled", "AbortError");
}
