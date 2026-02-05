import { atom } from "jotai";
import { playheadAtom } from "./playhead";
import { playbackRangeAtom } from "./range";

type PlaybackStatus = "stopped" | "playing" | "paused";

export const playbackStatusAtom = atom<PlaybackStatus>("stopped");

export const canStartPlaybackAtom = atom((get) => {
  return get(playbackStatusAtom) !== "playing";
});

export const canStopPlaybackAtom = atom((get) => {
  return get(playbackStatusAtom) !== "stopped";
});

export const canPausePlaybackAtom = atom((get) => {
  return get(playbackStatusAtom) === "playing";
});

export const startPlaybackAtom = atom(null, (get, set) => {
  const status = get(playbackStatusAtom);
  if (status !== "playing") {
    set(playbackStatusAtom, "playing");
  }
});

export const stopPlaybackAtom = atom(null, (get, set) => {
  set(playbackStatusAtom, "stopped");

  // set the playhead back to the start of the range
  set(playheadAtom, get(playbackRangeAtom).start);
});

export const pausePlaybackAtom = atom(null, (get, set) => {
  if (get(playbackStatusAtom) === "playing") {
    set(playbackStatusAtom, "paused");
  }
});
