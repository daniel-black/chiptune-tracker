import type { Store } from "jotai/vanilla/store";
import { NoiseChannel } from "./channels/noise-channel";
import { PulseChannel } from "./channels/pulse-channel";
import { playbackStatusAtom } from "../features/playback/atoms/playback";
import { synthesizedPlayheadRow } from "../atoms/song";
import { loopAtom } from "../features/playback/atoms/loop";
import { bpmAtom } from "../features/playback/atoms/bpm";
import { playheadAtom } from "../features/playback/atoms/playhead";
import { normalizedMasterVolumeAtom } from "../features/playback/atoms/master-volume";
import { channelMuteBaseAtom } from "../features/playback/atoms/mute";

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
  private subscriptionsStarted: boolean;

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
    this.subscriptionsStarted = false;
  }

  // React changes atoms -> engine reacts.
  public startSubscriptions(): void {
    if (this.subscriptionsStarted) return;
    this.subscriptionsStarted = true;

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
        const volume = this.store.get(normalizedMasterVolumeAtom);
        const clampedGain = Math.max(0, Math.min(volume, 1));

        this.masterGainNode.gain.setValueAtTime(
          clampedGain,
          this.ctx.currentTime,
        );
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

  private async onPlay() {
    if (this.scheduleIntervalId !== null) {
      console.error(
        `scheduleIntervalId already exists! ${this.scheduleIntervalId}`,
      );
      return;
    }

    if (!this.sourcesStarted) {
      this.startAllSources();
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    this.nextTickTime = this.ctx.currentTime;

    // Start the scheduler
    this.scheduleIntervalId = window.setInterval(
      () => this.scheduler(),
      this.schedulingIntervalMs,
    );
  }

  private scheduler(): void {
    if (this.store.get(playbackStatusAtom) !== "playing") {
      console.error(
        `Calling scheduler while playback status is ${this.store.get(playbackStatusAtom)}`,
      );
      return;
    }

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
    const muted = this.store.get(channelMuteBaseAtom);
    // console.log(time, row); // this keeps on getting logged even after pausing or stopping...

    for (let i = 0; i < row.length; i++) {
      const audio = row[i];
      const isMuted = muted[i];
      const channel = this.channels[i];

      if (audio.kind === "pulse" && channel instanceof PulseChannel) {
        channel.setFrequencyAtTime(audio.frequency, time);
        channel.changeWaveShape(audio.duty);
      }

      if (audio.kind === "noise" && channel instanceof NoiseChannel) {
        channel.setRateAtTime(audio.rate, time);
      }

      channel.setVolumeAtTime(audio.gain, time);

      if (isMuted) {
        channel.muteAtTime(time);
      } else {
        channel.unmuteAtTime(time);
      }
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
      this.store.set(playbackStatusAtom, "stopped");
      this.stopScheduler();
      return;
    }

    this.store.set(playheadAtom, nextPlayhead);
  }

  private async onPause() {
    this.stopScheduler();

    await this.ctx.suspend();
  }

  private onStop() {
    this.stopScheduler();
    this.silenceAllChannels();
  }

  private stopScheduler(): void {
    if (this.scheduleIntervalId !== null) {
      clearInterval(this.scheduleIntervalId);
      this.scheduleIntervalId = null;
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

  public stopSubscriptions(): void {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers = [];
    this.subscriptionsStarted = false;
  }

  dispose() {
    this.stopSubscriptions();
    this.ctx.close();
  }
}
