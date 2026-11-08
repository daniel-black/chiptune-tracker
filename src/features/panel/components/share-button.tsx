import { useCallback, useEffect, useState } from "react";
import { useAtomCallback } from "jotai/utils";
import { CheckIcon, Share2Icon } from "lucide-react";
import { currentSongIdAtom, songAtomFamily } from "@/atoms/song";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildShareUrl } from "@/lib/share";
import { track } from "@/lib/analytics";
import { getSongSource } from "@/lib/song-source";

type Status = "idle" | "copied" | "error";

/** Copies a link that contains the whole current song */
export function ShareButton() {
  const [status, setStatus] = useState<Status>("idle");

  // Read the song on click rather than subscribing, so edits don't re-render
  const getCurrentSong = useAtomCallback(
    useCallback((get) => {
      const id = get(currentSongIdAtom);
      return id ? get(songAtomFamily(id)) : null;
    }, []),
  );

  useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timeout);
  }, [status]);

  async function handleShare() {
    const song = getCurrentSong();
    if (!song) return;
    try {
      const url = await buildShareUrl(song);
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      track("share-link-created", {
        urlLength: url.length,
        source: getSongSource(song),
      });
    } catch (err) {
      console.error("Failed to copy share link", err);
      setStatus("error");
    }
  }

  const label = {
    idle: "Copy share link",
    copied: "Link copied!",
    error: "Couldn't copy link",
  }[status];

  return (
    <Tooltip open={status !== "idle" || undefined}>
      <TooltipTrigger asChild>
        <Button variant="outline" onClick={handleShare}>
          {status === "copied" ? <CheckIcon /> : <Share2Icon />}
          {status === "copied" ? "Copied" : "Share"}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
