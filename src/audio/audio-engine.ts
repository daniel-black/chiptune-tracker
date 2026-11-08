import type { Store } from "jotai/vanilla/store";
import { CHANNEL_CONFIG } from "./channel-config";
import type { Channel } from "./channels/channel";
import { NoiseChannel } from "./channels/noise-channel";
import { PulseChannel } from "./channels/pulse-channel";
import { synthesizeCell } from "./synthesis";
import { playbackClock } from "./playback-clock";
import { track, trackOnce } from "@/lib/analytics";
import { songAnalytics } from "@/lib/song-source";
import { defaultRange } from "./constants";
import { loopAtom } from "@/features/playback/atoms/loop";
import { bpmAtom } from "@/features/playback/atoms/bpm";
import { playheadAtom } from "@/features/playback/atoms/playhead";
import { playbackRangeAtom } from "@/features/playback/atoms/range";
import { channelEnableBaseAtom } from "@/features/playback/atoms/enable";
import {
  playbackStatusAtom,
  type PlaybackStatus,
} from "@/features/playback/atoms/playback";
import { normalizedMasterVolumeAtom } from "@/features/playback/atoms/master-volume";
import { sequencePositionAtom } from "@/features/playback/atoms/sequence-position";
import {
  currentSongIdAtom,
  currentPatternIdAtom,
  songAtomFamily,
} from "@/atoms/song";

/** Where the scheduler is in the song: the next row it will schedule */
type Cursor = {
  seqPos: number;
  patternId: string;
  row: number;
  /** First row after the whole song played and looped back to the start */
  afterFullSong?: boolean;
};

/** A row that has been scheduled, and when it will be heard */
type ScheduledRow = Cursor & { time: number; duration: number };

export class AudioEngine {
  private readonly ctx: AudioContext;
  private readonly masterGainNode: GainNode;

  private readonly channels: Channel[];

  private readonly schedulingIntervalMs = 50; // schedule next notes every 50ms
  private readonly rowsPerBeat = 4;
  private readonly lookAheadTime = 0.1; // 100ms
  private nextTickTime = 0;
  private scheduleIntervalId: number | null = null;
  private lastStatus: PlaybackStatus = "stopped";

  // The scheduler runs ahead of what's audible, so it keeps its own cursor and
  // a queue of upcoming rows. The UI atoms (playhead, current pattern,
  // sequence position) are only updated when a row is actually heard.
  private cursor: Cursor | null = null;
  private timeline: ScheduledRow[] = [];
  /** When the last row of a non-looping song finishes, if it's been scheduled */
  private endTime: number | null = null;
  /** Whether the end being played out is the end of the whole song */
  private endIsFullSong = false;
  /** The timeline row the UI last synced to, to spot when a new one starts */
  private lastSynced: ScheduledRow | null = null;
  private frameId: number | null = null;

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
        const prevStatus = this.lastStatus;
        this.lastStatus = status;

        switch (status) {
          case "playing":
            this.onPlay(prevStatus === "paused");
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

    // store.sub only fires on change, so apply the initial volume up front
    this.applyMasterVolume();
    this.unsubscribers.push(
      this.store.sub(normalizedMasterVolumeAtom, () =>
        this.applyMasterVolume(),
      ),
    );
  }

  private applyMasterVolume(): void {
    const volume = this.store.get(normalizedMasterVolumeAtom);
    const clampedGain = Math.max(0, Math.min(volume, 1));

    this.masterGainNode.gain.setValueAtTime(clampedGain, this.ctx.currentTime);
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

  private async onPlay(resuming: boolean) {
    if (this.scheduleIntervalId !== null) {
      console.error(
        `scheduleIntervalId already exists! ${this.scheduleIntervalId}`,
      );
      return;
    }

    // Compute initial sequence position from the current pattern. When resuming
    // from pause, keep the existing position (the pattern may appear more than
    // once). Likewise if the position already points at this pattern, e.g. the
    // user picked a specific entry in the arrangement.
    const songId = this.store.get(currentSongIdAtom);
    const patternId = this.store.get(currentPatternIdAtom);
    if (!resuming && songId && patternId) {
      const song = this.store.get(songAtomFamily(songId));
      const currentPos = this.store.get(sequencePositionAtom);
      if (song.patternOrder[currentPos] !== patternId) {
        const pos = song.patternOrder.indexOf(patternId);
        this.store.set(sequencePositionAtom, pos !== -1 ? pos : 0);
      }
    }

    if (!resuming && songId) {
      trackOnce("playback-started", this.songData(songId));
    }

    if (!this.sourcesStarted) {
      this.startAllSources();
    }

    if (this.ctx.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.error("Audio could not start", err);
        track("audio-error", { stage: "resume" });
        this.store.set(playbackStatusAtom, "stopped");
        return;
      }
    }

    // The context clock is frozen while suspended, so on resume the rows already
    // scheduled ahead of the pause are still valid; continue right after them.
    if (!resuming || !this.cursor) {
      this.nextTickTime = this.ctx.currentTime;
      this.timeline = [];
      this.endTime = null;
      this.endIsFullSong = false;
      this.lastSynced = null;
      this.cursor = this.cursorFromStore();
      playbackClock.position = this.store.get(playheadAtom);
    }

    // Playback may have been paused/stopped, or another onPlay may have started
    // the scheduler, while awaiting resume()
    if (
      this.store.get(playbackStatusAtom) !== "playing" ||
      this.scheduleIntervalId !== null
    ) {
      return;
    }

    // Start the scheduler
    this.scheduleIntervalId = window.setInterval(
      () => this.scheduler(),
      this.schedulingIntervalMs,
    );
    this.scheduler();
    this.startFrameLoop();
  }

  private songData(songId: string) {
    return songAnalytics(this.store.get(songAtomFamily(songId)));
  }

  /** The whole song was heard through to its last row */
  private trackSongFinished(): void {
    const songId = this.store.get(currentSongIdAtom);
    if (songId) trackOnce("playback-finished", this.songData(songId));
  }

  private cursorFromStore(): Cursor | null {
    const songId = this.store.get(currentSongIdAtom);
    const patternId = this.store.get(currentPatternIdAtom);
    if (!songId || !patternId) return null;

    return {
      seqPos: this.store.get(sequencePositionAtom),
      patternId,
      row: this.store.get(playheadAtom),
    };
  }

  private scheduler(): void {
    if (this.store.get(playbackStatusAtom) !== "playing") {
      console.error(
        `Calling scheduler while playback status is ${this.store.get(playbackStatusAtom)}`,
      );
      return;
    }

    // Schedule notes until we're a bit ahead of current time
    while (
      this.cursor &&
      this.endTime === null &&
      this.nextTickTime < this.ctx.currentTime + this.lookAheadTime
    ) {
      const duration = this.getSecondsPerTick();
      this.scheduleRow(this.cursor, this.nextTickTime);
      this.timeline.push({ ...this.cursor, time: this.nextTickTime, duration });
      this.nextTickTime += duration;

      const next = this.nextCursor(this.cursor);
      if (next) {
        this.cursor = next;
      } else {
        // End of the song: let the last row play out, then stop
        this.endTime = this.nextTickTime;
        this.endIsFullSong = this.isFullRange();
      }
    }

    // Also sync here: animation frames pause in background tabs, and the
    // timeline must not grow without bound.
    this.syncToAudio();
  }

  private scheduleRow(cursor: Cursor, time: number): void {
    const songId = this.store.get(currentSongIdAtom);
    if (!songId) return;
    const song = this.store.get(songAtomFamily(songId));
    const cells = song.patterns[cursor.patternId]?.data[cursor.row];
    if (!cells) return;

    const row = cells.map(synthesizeCell);
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

  /** The row after `cursor`, following the arrangement. Null at the end. */
  private nextCursor(cursor: Cursor): Cursor | null {
    const range = this.store.get(playbackRangeAtom);
    if (cursor.row + 1 <= range.end) {
      return { ...cursor, row: cursor.row + 1 };
    }

    // End of this pattern's range: move along the arrangement
    const songId = this.store.get(currentSongIdAtom);
    if (!songId) return null;
    const { patternOrder } = this.store.get(songAtomFamily(songId));

    const nextPos = cursor.seqPos + 1;
    if (nextPos < patternOrder.length) {
      return { seqPos: nextPos, patternId: patternOrder[nextPos], row: range.start };
    }
    if (this.store.get(loopAtom)) {
      return {
        seqPos: 0,
        patternId: patternOrder[0],
        row: range.start,
        afterFullSong: this.isFullRange(),
      };
    }
    return null;
  }

  /** Looping a short range while composing isn't listening to the song */
  private isFullRange(): boolean {
    const range = this.store.get(playbackRangeAtom);
    return range.start === defaultRange.start && range.end === defaultRange.end;
  }

  /** The audio clock, adjusted for the delay before sound reaches the speakers */
  private audibleTime(): number {
    return this.ctx.currentTime - (this.ctx.outputLatency || 0);
  }

  /**
   * Bring the UI in line with what's audible: update the playhead atoms when a
   * new row starts, and the fine-grained playbackClock every call.
   */
  private syncToAudio(): void {
    if (this.store.get(playbackStatusAtom) !== "playing") return;
    const now = this.audibleTime();

    if (this.endTime !== null && now >= this.endTime) {
      if (this.endIsFullSong) this.trackSongFinished();
      const range = this.store.get(playbackRangeAtom);
      this.store.set(playbackStatusAtom, "stopped");
      this.store.set(playheadAtom, range.start);
      return;
    }

    // Drop rows that have finished; the head is the row being heard
    while (this.timeline.length > 1 && this.timeline[1].time <= now) {
      this.timeline.shift();
    }
    const current = this.timeline[0];
    if (!current || current.time > now) return;

    if (current !== this.lastSynced) {
      this.lastSynced = current;
      if (current.afterFullSong) this.trackSongFinished();
    }

    if (this.store.get(sequencePositionAtom) !== current.seqPos) {
      this.store.set(sequencePositionAtom, current.seqPos);
    }
    if (this.store.get(currentPatternIdAtom) !== current.patternId) {
      this.store.set(currentPatternIdAtom, current.patternId);
    }
    if (this.store.get(playheadAtom) !== current.row) {
      this.store.set(playheadAtom, current.row);
    }

    const progress = (now - current.time) / current.duration;
    playbackClock.position = current.row + Math.min(Math.max(progress, 0), 1);
  }

  private startFrameLoop(): void {
    if (this.frameId !== null) return;
    const tick = () => {
      this.syncToAudio();
      this.frameId =
        this.store.get(playbackStatusAtom) === "playing"
          ? requestAnimationFrame(tick)
          : null;
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private stopFrameLoop(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }

  private async onPause() {
    this.stopScheduler();
    this.stopFrameLoop();

    await this.ctx.suspend();
  }

  private onStop() {
    this.stopScheduler();
    this.stopFrameLoop();
    this.cursor = null;
    this.timeline = [];
    this.endTime = null;
    this.lastSynced = null;
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
