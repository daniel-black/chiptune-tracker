import type { Store } from "jotai/vanilla/store";
import { NoiseChannel } from "./channels/noise-channel";
import { PulseChannel } from "./channels/pulse-channel";
import { playbackStatusAtom } from "../features/playback/atoms/playback";
import { synthesizedPlayheadRow } from "../atoms/song";
import { loopAtom } from "../features/playback/atoms/loop";
import { bpmAtom } from "../features/playback/atoms/bpm";
import { playheadAtom } from "../features/playback/atoms/playhead";
import { normalizedMasterVolumeAtom } from "../features/playback/atoms/master-volume";

export class AudioEngine {
  // Audio Context and master volume
  private readonly ctx: AudioContext;
  private readonly masterGainNode: GainNode;

  private readonly channels: [
    PulseChannel,
    PulseChannel,
    PulseChannel,
    NoiseChannel,
  ];

  private readonly schedulingIntervalMs = 50; // schedule next notes every 50ms
  private readonly rowsPerBeat = 4;
  private readonly lookAheadTime = 0.1; // 100ms
  private nextTickTime = 0;
  private scheduleIntervalId: number | null = null;
  private sourcesStarted: boolean;

  // for store
  private readonly store: Store;
  private unsubscribers: Array<() => void> = [];

  constructor(store: Store) {
    this.store = store;
    this.ctx = new AudioContext();

    // Create a master gain node & connect it to the audio context destination
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.connect(this.ctx.destination);

    this.channels = [
      new PulseChannel(this.ctx, this.masterGainNode),
      new PulseChannel(this.ctx, this.masterGainNode),
      new PulseChannel(this.ctx, this.masterGainNode),
      new NoiseChannel(this.ctx, this.masterGainNode),
    ];

    this.sourcesStarted = false;
  }

  // React changes atoms -> engine reacts.
  public startSubscriptions(): void {
    // subscribe to playback status
    this.unsubscribers.push(
      this.store.sub(playbackStatusAtom, () => {
        const status = this.store.get(playbackStatusAtom);

        switch (status) {
          case "playing":
            this.onPlay();
            return;
          case "paused":
            this.onPause();
            return;
          case "stopped":
            this.onStop();
            return;
        }
      }),
    );

    this.unsubscribers.push(
      this.store.sub(normalizedMasterVolumeAtom, () => {
        const gain = this.store.get(normalizedMasterVolumeAtom);
        if (gain >= 0 || gain <= 1) {
          this.masterGainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
        }
      }),
    );
  }

  private startAllSources(): void {
    this.channels.forEach((channel) => channel.start());
    this.sourcesStarted = true; // Prevent starting the sources multiple times
  }

  private getBpm(): number {
    return this.store.get(bpmAtom);
  }

  private getSecondsPerTick(): number {
    return 60 / (this.getBpm() * this.rowsPerBeat);
  }

  private onPlay() {
    console.log("[AUDIO ENGINE] PLAYING");

    if (!this.sourcesStarted) {
      this.startAllSources();
    }

    this.nextTickTime = this.ctx.currentTime;

    // Start the scheduler
    this.scheduleIntervalId = window.setInterval(
      () => this.scheduler(),
      this.schedulingIntervalMs,
    );
  }

  private scheduler(): void {
    // Schedule notes until we're a bit ahead of current time
    while (this.nextTickTime < this.ctx.currentTime + this.lookAheadTime) {
      // Schedule the current row
      this.scheduleRow(this.nextTickTime);

      // Move to next row
      this.advancePlayhead();

      // Calculate the time for the next row
      this.nextTickTime += this.getSecondsPerTick();
    }
  }

  private scheduleRow(time: number): void {
    const row = this.store.get(synthesizedPlayheadRow);
    console.log(time, row);

    for (let i = 0; i < row.length; i++) {
      const features = row[i];
      const channel = this.channels[i];

      if (features.kind === "pulse" && channel instanceof PulseChannel) {
        channel.setFrequencyAtTime(features.frequency, time);
        channel.changeWaveShape(features.duty);
      }

      if (features.kind === "noise" && channel instanceof NoiseChannel) {
        channel.setRateAtTime(features.rate, time);
      }

      channel.setVolumeAtTime(features.gain, time);
    }
  }

  private advancePlayhead(): void {
    const prevPlayhead = this.store.get(playheadAtom);
    let nextPlayhead = prevPlayhead + 1;

    const loop = this.store.get(loopAtom);

    if (nextPlayhead > 63) {
      if (loop) {
        nextPlayhead = 0;
        this.store.set(playheadAtom, nextPlayhead);
        return;
      }

      // stop
      this.onStop();
      return;
    }

    this.store.set(playheadAtom, nextPlayhead);
  }

  private onPause() {
    console.log("[AUDIO ENGINE] PAUSED");
  }

  private onStop() {
    console.log("[AUDIO ENGINE] STOPPED");

    this.stopScheduling();
    this.silenceAllChannels();
  }

  private stopScheduling(): void {
    if (this.scheduleIntervalId !== null) {
      clearInterval(this.scheduleIntervalId);
      this.scheduleIntervalId = null;
    }

    // If playback reaches the end of the song and loop is false, stop the playback
    if (this.store.get(playbackStatusAtom) === "playing") {
      this.store.set(playbackStatusAtom, "stopped");
    }
  }

  private silenceAllChannels(): void {
    this.channels.forEach((channel) => {
      const now = this.ctx.currentTime;
      channel.cancelScheduledGainValues(now);
      channel.setVolumeAtTime(0, now);

      if (channel instanceof PulseChannel) {
        channel.cancelScheduledFrequencyValues(now);
        channel.setFrequencyAtTime(0, now);
      }
    });
  }

  dispose() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.ctx.close();
  }
}
