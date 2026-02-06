import { store } from "@/store";
import { AudioEngine } from "@/audio/audio-engine";

// lazily instantiate so that AudioEngine is not created until first needed
let audioEngine: AudioEngine | null = null;

export function initAudioOnce() {
  if (!audioEngine) {
    audioEngine = new AudioEngine(store);
  }

  audioEngine.startSubscriptions(); // set up subscriptions
}

export function stopSubscriptions() {
  audioEngine?.stopSubscriptions();
}
