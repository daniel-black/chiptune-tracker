import { atom } from "jotai";

export const loopAtom = atom(false); // atom that holds state of whether or not playback should loop

export const bpmAtom = atom(120); // beats per min for the playback

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

export const stopPlaybackAtom = atom(null, (_, set) => {
  set(playbackStatusAtom, "stopped");
  // set the playhead back to the start of the range
});

export const pausePlaybackAtom = atom(null, (get, set) => {
  if (get(playbackStatusAtom) === "playing") {
    set(playbackStatusAtom, "paused");
    // retain the position of the playhead
  }
});

export const playheadAtom = atom<number>(0); // by default, play from first row
