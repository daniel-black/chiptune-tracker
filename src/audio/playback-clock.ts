/**
 * Where playback is right now, as heard: the row index plus how far through
 * that row the audio is (e.g. 12.5 is halfway through row 12). The audio
 * engine writes this every animation frame; read it from requestAnimationFrame
 * loops rather than React state so the playhead can move smoothly without
 * re-rendering the grid.
 */
export const playbackClock = {
  position: 0,
};
