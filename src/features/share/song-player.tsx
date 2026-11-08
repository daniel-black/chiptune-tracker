import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { renderSongAudio } from "@/audio/render-wav";
import {
  VIDEO_SIZE,
  buildTimeline,
  createMeterState,
  drawFrame,
  loadVideoFonts,
  type VideoTimeline,
} from "@/export/video-frame";
import { Button } from "@/components/ui/button";
import type { Song } from "@/models/song";

/** The render is normalized near full scale; play it at the app's usual level */
const PLAYBACK_GAIN = 0.5;

type Status = "loading" | "ready" | "playing" | "paused" | "ended" | "error";

/**
 * Plays a song with the same animated grid as the video export. The audio is
 * rendered once up front (well under a second for most songs), so pressing
 * play is instant and the picture follows the audio clock exactly.
 */
export function SongPlayer({
  song,
  onFirstPlay,
}: {
  song: Song;
  onFirstPlay?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>("loading");

  // Playback state lives in a ref: it changes every frame
  const playback = useRef({
    buffer: null as AudioBuffer | null,
    timeline: null as VideoTimeline | null,
    meters: createMeterState(),
    ctx: null as AudioContext | null,
    source: null as AudioBufferSourceNode | null,
    startedAt: 0, // ctx time that corresponds to song time 0
    offset: 0, // song time while paused
    frameId: 0,
    played: false,
  });

  // Render audio and draw the first frame
  useEffect(() => {
    let cancelled = false;
    const p = playback.current;
    p.timeline = buildTimeline(song);
    p.meters = createMeterState();

    // Show the first frame as soon as the fonts are in, before audio is ready
    const fonts = loadVideoFonts().then(() => {
      if (!cancelled) draw(0);
    });

    Promise.all([renderSongAudio(song), fonts])
      .then(([{ buffer }]) => {
        if (cancelled) return;
        p.buffer = buffer;
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Couldn't prepare the song", err);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [song]);

  // Stop everything when leaving the page
  useEffect(() => {
    const p = playback.current;
    return () => {
      cancelAnimationFrame(p.frameId);
      p.source?.stop();
      p.ctx?.close();
    };
  }, []);

  function draw(time: number) {
    const ctx = canvasRef.current?.getContext("2d");
    const p = playback.current;
    if (ctx && p.timeline) drawFrame(ctx, p.timeline, time, p.meters);
  }

  function currentTime(): number {
    const p = playback.current;
    return p.ctx ? p.ctx.currentTime - p.startedAt : 0;
  }

  function tick() {
    const p = playback.current;
    const time = currentTime();
    if (p.timeline && time >= p.timeline.songSeconds) {
      draw(p.timeline.songSeconds);
      stopSource();
      p.offset = 0;
      setStatus("ended");
      return;
    }
    draw(time);
    p.frameId = requestAnimationFrame(tick);
  }

  function stopSource() {
    const p = playback.current;
    cancelAnimationFrame(p.frameId);
    if (p.source) {
      p.source.onended = null;
      p.source.stop();
      p.source = null;
    }
  }

  async function play() {
    const p = playback.current;
    if (!p.buffer) return;

    // Created on the first press: browsers only allow audio after a gesture
    p.ctx ??= new AudioContext();
    if (p.ctx.state === "suspended") await p.ctx.resume();

    const gain = new GainNode(p.ctx, { gain: PLAYBACK_GAIN });
    gain.connect(p.ctx.destination);
    const source = new AudioBufferSourceNode(p.ctx, { buffer: p.buffer });
    source.connect(gain);
    source.start(0, p.offset);

    p.source = source;
    p.startedAt = p.ctx.currentTime - p.offset;
    if (p.offset === 0) p.meters = createMeterState();
    setStatus("playing");
    p.frameId = requestAnimationFrame(tick);

    if (!p.played) {
      p.played = true;
      onFirstPlay?.();
    }
  }

  function pause() {
    const p = playback.current;
    p.offset = currentTime();
    stopSource();
    setStatus("paused");
  }

  function restart() {
    const p = playback.current;
    stopSource();
    p.offset = 0;
    void play();
  }

  const isPlaying = status === "playing";
  const canPlay = status !== "loading" && status !== "error";

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border bg-[#0d0e12]">
        <canvas
          ref={canvasRef}
          width={VIDEO_SIZE}
          height={VIDEO_SIZE}
          className="block w-full aspect-square"
          aria-label={`${song.name || "Untitled song"}: animated tracker grid`}
        />

        {/* Big play button until it's playing; clicking the picture toggles */}
        <button
          type="button"
          onClick={isPlaying ? pause : play}
          disabled={!canPlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="group absolute inset-0 flex items-center justify-center outline-none focus-visible:ring-4 focus-visible:ring-ring rounded-2xl"
        >
          {!isPlaying && (
            <span className="flex size-20 sm:size-24 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform group-hover:scale-105 group-disabled:opacity-60">
              {status === "loading" ? (
                <span className="size-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
              ) : status === "ended" ? (
                <RotateCcwIcon className="size-9" />
              ) : (
                <PlayIcon className="size-10 translate-x-0.5 fill-current" />
              )}
            </span>
          )}
        </button>
      </div>

      {status === "error" ? (
        <p className="text-sm text-destructive">
          This song couldn't be played in your browser.
        </p>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={isPlaying ? pause : play}
            disabled={!canPlay}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            {isPlaying ? "Pause" : status === "ended" ? "Play again" : "Play"}
          </Button>
          <Button
            variant="ghost"
            onClick={restart}
            disabled={!canPlay || status === "ready"}
            aria-label="Restart"
          >
            <RotateCcwIcon />
          </Button>
        </div>
      )}
    </div>
  );
}
