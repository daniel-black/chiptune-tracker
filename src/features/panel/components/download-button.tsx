import { useCallback, useRef, useState } from "react";
import { useAtomCallback } from "jotai/utils";
import {
  CheckIcon,
  DownloadIcon,
  FileAudioIcon,
  FileTextIcon,
  FileVideoIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { currentSongIdAtom, songAtomFamily } from "@/atoms/song";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { track } from "@/lib/analytics";
import { getSongSource } from "@/lib/song-source";
import { songToText } from "@/lib/song-text";
import type { Song } from "@/models/song";

type Format = "wav" | "m4a" | "mp4";

/** "It's da song!" -> "its-da-song.wav" */
function fileName(name: string, format: Format): string {
  const slug = name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "untitled-song"}.${format}`;
}

/**
 * File size per second of song, for the estimates in the menu. WAV is exact
 * (44.1 kHz, 16-bit mono) and M4A's bitrate is nearly constant. Video isn't
 * estimated: its size depends on how much the picture changes, so a per-second
 * rate was off by 25% or more.
 */
const BYTES_PER_SECOND = {
  wav: 44100 * 2,
  m4a: 24_600,
};
/** Matches the short tail every export adds after the last row */
const TAIL_SECONDS = 0.25;

function songSeconds(song: Song): number {
  const rows = song.patternOrder.reduce(
    (total, id) => total + (song.patterns[id]?.data.length ?? 0),
    0,
  );
  return (rows * 60) / (song.bpm * 4) + TAIL_SECONDS;
}

/** 786000 -> "~790 KB", 7280000 -> "~7.3 MB" */
function formatSize(bytes: number): string {
  if (bytes < 1_000_000) {
    return `~${Math.max(10, Math.round(bytes / 10_000) * 10)} KB`;
  }
  return `~${(bytes / 1_000_000).toFixed(1)} MB`;
}

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  // Give the browser a moment to start the download before releasing it
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Download the song as audio (WAV or M4A) or a video for social media (MP4) */
export function DownloadButton() {
  const [rendering, setRendering] = useState<Format | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // null while unknown: checked the first time the menu opens
  const [support, setSupport] = useState<{ m4a: boolean; mp4: boolean } | null>(
    null,
  );
  // Estimated from the song's length each time the menu opens
  const [seconds, setSeconds] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // Read the song on click rather than subscribing, so edits don't re-render
  const getCurrentSong = useAtomCallback(
    useCallback((get) => {
      const id = get(currentSongIdAtom);
      return id ? get(songAtomFamily(id)) : null;
    }, []),
  );

  async function handleMenuOpen(open: boolean) {
    if (!open) return;
    const song = getCurrentSong();
    if (song) setSeconds(songSeconds(song));
    if (support !== null) return;
    const [{ canRenderVideo }, { canRenderM4a }] = await Promise.all([
      import("@/export/render-video"),
      import("@/export/render-m4a"),
    ]);
    const [mp4, m4a] = await Promise.all([canRenderVideo(), canRenderM4a()]);
    setSupport({ mp4, m4a });
  }

  async function exportAs(format: Format) {
    const song = getCurrentSong();
    if (!song || rendering) return;

    setRendering(format);
    setProgress(0);
    setError(null);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const { blob, seconds } = await render(song, format, abort.signal, setProgress);
      saveFile(blob, fileName(song.name, format));
      track("export", {
        format,
        source: getSongSource(song),
        seconds: Math.round(seconds),
      });
      setRendering(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        track("export-cancelled", { format });
        setRendering(null);
        return;
      }
      console.error(`Couldn't export ${format}`, err);
      track("export-failed", { format });
      setError("Something went wrong while exporting. Please try again.");
      setRendering(null);
    } finally {
      abortRef.current = null;
    }
  }

  /** The text format, for pasting into a chatbot to extend or remix */
  async function copyAsText() {
    const song = getCurrentSong();
    if (!song) return;
    try {
      await navigator.clipboard.writeText(songToText(song));
      track("export", { format: "text", source: getSongSource(song) });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Couldn't copy song text", err);
      track("export-failed", { format: "text" });
      setError("Couldn't copy to the clipboard. Please try again.");
    }
  }

  function closeVideoDialog() {
    abortRef.current?.abort();
    setRendering(null);
    setError(null);
  }

  return (
    <>
      <DropdownMenu onOpenChange={handleMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={rendering !== null && rendering !== "mp4"}
            aria-label="Download song"
          >
            {/* Audio exports take a moment; video has its own progress dialog */}
            {rendering !== null && rendering !== "mp4" ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : copied ? (
              <CheckIcon />
            ) : (
              <DownloadIcon />
            )}
            {/* Labelled like Share; icon only where the title row is tight */}
            <span className="hidden sm:inline">{copied ? "Copied" : "Download"}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Save this song as…</DropdownMenuLabel>
          <ExportOption
            icon={FileVideoIcon}
            title="Video to post"
            detail="Square MP4 of the grid playing"
            unsupported={support?.mp4 === false}
            onSelect={() => exportAs("mp4")}
          />
          <ExportOption
            icon={FileAudioIcon}
            title="Audio to listen to or send"
            detail={`M4A · ${formatSize(seconds * BYTES_PER_SECOND.m4a)}`}
            unsupported={support?.m4a === false}
            onSelect={() => exportAs("m4a")}
          />
          <ExportOption
            icon={FileAudioIcon}
            title="Audio for editing"
            detail={`WAV, full quality · ${formatSize(seconds * BYTES_PER_SECOND.wav)}`}
            onSelect={() => exportAs("wav")}
          />
          <ExportOption
            icon={FileTextIcon}
            title="Text for chatbots"
            detail="Copies the song as plain text"
            onSelect={copyAsText}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={rendering === "mp4" || error !== null}
        onOpenChange={(open) => !open && closeVideoDialog()}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{error ? "Export failed" : "Making your video"}</DialogTitle>
            <DialogDescription>
              {error ??
                "Rendering every frame of the song. It downloads automatically when it's done."}
            </DialogDescription>
          </DialogHeader>
          {!error && (
            <div className="space-y-1.5">
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress * 100)}
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                />
              </div>
              <p className="text-right text-xs tabular-nums text-muted-foreground">
                {Math.round(progress * 100)}%
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeVideoDialog}>
              {error ? "Close" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Renderers are loaded on demand: only people who export need them */
async function render(
  song: Song,
  format: Format,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<{ blob: Blob; seconds: number }> {
  if (format === "wav") {
    const { renderSongToWav } = await import("@/audio/render-wav");
    return renderSongToWav(song);
  }
  if (format === "m4a") {
    const { renderSongToM4a } = await import("@/export/render-m4a");
    return renderSongToM4a(song);
  }
  const { renderSongToMp4 } = await import("@/export/render-video");
  return renderSongToMp4(song, { onProgress, signal });
}

function ExportOption({
  icon: Icon,
  title,
  detail,
  unsupported = false,
  onSelect,
}: {
  icon: typeof FileAudioIcon;
  title: string;
  detail: string;
  unsupported?: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenuItem onSelect={onSelect} disabled={unsupported}>
      <Icon />
      <div className="flex flex-col">
        <span>{title}</span>
        <span className="text-muted-foreground">
          {unsupported ? "Needs Chrome, Edge or Safari" : detail}
        </span>
      </div>
    </DropdownMenuItem>
  );
}
