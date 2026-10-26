import type { Song } from "@/models/song";
import defaultSongJson from "@/data/default-song.json";

const defaultSong = defaultSongJson as Song;

/** Set once the demo song has been offered, so deleting it doesn't bring it back */
const SEEDED_KEY = "defaultSongSeeded";

/**
 * Writes the demo song to localStorage the first time the site is visited, so
 * new visitors have something to play right away. Must run before any song
 * atoms read from storage.
 */
export function seedDefaultSong() {
  try {
    if (localStorage.getItem(SEEDED_KEY)) return;

    const index: string[] = JSON.parse(
      localStorage.getItem("songIndex") ?? "[]",
    );

    if (!index.includes(defaultSong.id)) {
      localStorage.setItem(`song:${defaultSong.id}`, JSON.stringify(defaultSong));
      localStorage.setItem(
        "songIndex",
        JSON.stringify([defaultSong.id, ...index]),
      );
    }

    localStorage.setItem(SEEDED_KEY, "true");
  } catch {
    // Storage unavailable or corrupt — skip seeding rather than break the app
  }
}
