import { store } from "./store";
import { AudioEngine } from "./audio/audio-engine";

export const audioEngine = new AudioEngine(store);

export function initAudioOnce() {
  audioEngine.startSubscriptions(); // set up subscriptions
}
