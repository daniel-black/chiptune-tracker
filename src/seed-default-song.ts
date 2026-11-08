import type { Song } from "@/models/song";
import pixelSunrise from "@/data/default-song.json";
import shadowGate from "@/data/demo-shadow-gate.json";
import wildEncounter from "@/data/demo-wild-encounter.json";
import { trackOnce } from "@/lib/analytics";

/** Demo songs offered to every visitor, in the order they're listed */
export const demoSongs = [pixelSunrise, shadowGate, wildEncounter] as Song[];

/** IDs of demos already offered, so deleting one doesn't bring it back */
const SEEDED_IDS_KEY = "seededDemoIds";
/** Older versions only had one demo and recorded it with this flag */
const LEGACY_SEEDED_KEY = "defaultSongSeeded";

/**
 * Writes each demo song to localStorage the first time it's offered, so new
 * visitors have something to play right away and existing visitors pick up
 * demos added later. Must run before any song atoms read from storage.
 */
export function seedDefaultSong() {
  try {
    const seeded = new Set<string>(
      JSON.parse(localStorage.getItem(SEEDED_IDS_KEY) ?? "[]"),
    );
    if (localStorage.getItem(LEGACY_SEEDED_KEY)) {
      seeded.add(demoSongs[0].id);
    }

    const index: string[] = JSON.parse(
      localStorage.getItem("songIndex") ?? "[]",
    );

    for (const song of demoSongs) {
      if (seeded.has(song.id)) continue;
      if (!index.includes(song.id)) {
        localStorage.setItem(`song:${song.id}`, JSON.stringify(song));
        index.push(song.id);
      }
      seeded.add(song.id);
    }

    localStorage.setItem("songIndex", JSON.stringify(index));
    localStorage.setItem(SEEDED_IDS_KEY, JSON.stringify([...seeded]));
    localStorage.removeItem(LEGACY_SEEDED_KEY);
  } catch (err) {
    // Storage unavailable or corrupt — skip seeding rather than break the app
    console.error("Couldn't seed demo songs", err);
    trackOnce("storage-error", {
      op: "seed",
      reason: err instanceof DOMException ? err.name : "unknown",
    });
  }
}
