import { store } from "@/store";
import { AudioEngine } from "@/audio/audio-engine";
import { track } from "@/lib/analytics";

// lazily instantiate so that AudioEngine is not created until first needed
let audioEngine: AudioEngine | null = null;

export function initAudioOnce() {
  if (!audioEngine) {
    try {
      audioEngine = new AudioEngine(store);
    } catch (err) {
      // e.g. Web Audio unsupported or blocked; the editor still works silently
      console.error("Audio engine could not be created", err);
      track("audio-error", { stage: "create" });
      return;
    }
  }

  audioEngine.startSubscriptions(); // set up subscriptions
}

export function stopSubscriptions() {
  audioEngine?.stopSubscriptions();
}
