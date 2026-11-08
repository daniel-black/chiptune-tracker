import type { Song } from "@/models/song";
import { demoSongs } from "@/seed-default-song";

export type SongSource = "preset" | "own" | "shared";

/** Whether a song is a demo, the visitor's own, or opened from a share link */
export function getSongSource(song: Pick<Song, "id" | "source">): SongSource {
  if (demoSongs.some((demo) => demo.id === song.id)) return "preset";
  return song.source === "shared" ? "shared" : "own";
}

/**
 * Analytics data describing a song: its source, plus the demo's name for
 * demos (never the name of a visitor's own song, which could be personal).
 */
export function songAnalytics(
  song: Pick<Song, "id" | "source">,
): Record<string, string> {
  const demo = demoSongs.find((d) => d.id === song.id);
  return demo
    ? { source: "preset", demo: demo.name }
    : { source: getSongSource(song) };
}
