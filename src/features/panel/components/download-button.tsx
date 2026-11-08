import { useCallback, useState } from "react";
import { useAtomCallback } from "jotai/utils";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";
import { currentSongIdAtom, songAtomFamily } from "@/atoms/song";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { track } from "@/lib/analytics";
import { getSongSource } from "@/lib/song-source";

/** "It's da song!" -> "its-da-song.wav" */
function wavFileName(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "untitled-song"}.wav`;
}

/** Renders the whole song to a WAV file and downloads it */
export function DownloadButton() {
  const [status, setStatus] = useState<"idle" | "rendering" | "error">("idle");

  // Read the song on click rather than subscribing, so edits don't re-render
  const getCurrentSong = useAtomCallback(
    useCallback((get) => {
      const id = get(currentSongIdAtom);
      return id ? get(songAtomFamily(id)) : null;
    }, []),
  );

  async function handleDownload() {
    const song = getCurrentSong();
    if (!song || status === "rendering") return;

    setStatus("rendering");
    try {
      // Loaded on demand: only people who export need the renderer
      const { renderSongToWav } = await import("@/audio/render-wav");
      const { blob, seconds } = await renderSongToWav(song);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = wavFileName(song.name);
      link.click();
      // Give the browser a moment to start the download before releasing it
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      track("export", {
        format: "wav",
        source: getSongSource(song),
        seconds: Math.round(seconds),
      });
      setStatus("idle");
    } catch (err) {
      console.error("Couldn't export song", err);
      track("export-failed", { format: "wav" });
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const label = {
    idle: "Download as WAV",
    rendering: "Rendering…",
    error: "Export failed, try again",
  }[status];

  return (
    <Tooltip open={status === "error" || undefined}>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleDownload}
          disabled={status === "rendering"}
          aria-label={label}
        >
          {status === "rendering" ? (
            <LoaderCircleIcon className="animate-spin" />
          ) : (
            <DownloadIcon />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
