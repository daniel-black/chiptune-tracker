import { store } from "./store";
import { AudioEngine } from "./audio/audio-engine";

const audioEngine = new AudioEngine(store);

export function initAudioOnce() {
  audioEngine.startSubscriptions(); // set up subscriptions
}

export function stopSubscriptions() {
  audioEngine.stopSubscriptions();
}
