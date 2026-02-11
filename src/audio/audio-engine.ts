import type { Store } from "jotai/vanilla/store";
import { CHANNEL_CONFIG } from "./channel-config";
import type { Channel } from "./channels/channel";
import { NoiseChannel } from "./channels/noise-channel";
import { PulseChannel } from "./channels/pulse-channel";
import { synthesizedPlayheadRowAtom } from "@/atoms/pattern";
import { loopAtom } from "@/features/playback/atoms/loop";
import { bpmAtom } from "@/features/playback/atoms/bpm";
import { playheadAtom } from "@/features/playback/atoms/playhead";
import { playbackRangeAtom } from "@/features/playback/atoms/range";
import { channelEnableBaseAtom } from "@/features/playback/atoms/enable";
import { playbackStatusAtom } from "@/features/playback/atoms/playback";
import { normalizedMasterVolumeAtom } from "@/features/playback/atoms/master-volume";

export class AudioEngine {
  private readonly ctx: AudioContext;
  private readonly masterGainNode: GainNode;

  private readonly channels: Channel[];

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

    this.channels = CHANNEL_CONFIG.map((ch) => {
      switch (ch.kind) {
        case "pulse":
          return new PulseChannel(this.ctx, this.masterGainNode);
        case "noise":
          return new NoiseChannel(this.ctx, this.masterGainNode);
      }
    });

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
    const row = this.store.get(synthesizedPlayheadRowAtom);
    const enabled = this.store.get(channelEnableBaseAtom);

    for (let i = 0; i < row.length; i++) {
      const channel = this.channels[i];

      channel.scheduleCell(row[i], time);

      if (enabled[i]) {
        channel.unmuteAtTime(time);
      } else {
        channel.muteAtTime(time);
      }
    }
  }

  private advancePlayhead(): void {
    const loop = this.store.get(loopAtom);
    const range = this.store.get(playbackRangeAtom);
    const playhead = this.store.get(playheadAtom);

    if (playhead + 1 > range.end) {
      if (loop) {
        this.store.set(playheadAtom, range.start);
        return;
      }

      // stop
      this.store.set(playbackStatusAtom, "stopped");
      this.store.set(playheadAtom, range.start);
      return;
    }

    this.store.set(playheadAtom, playhead + 1);
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
    const now = this.ctx.currentTime;
    this.channels.forEach((channel) => channel.silence(now));
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
