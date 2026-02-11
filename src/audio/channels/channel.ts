import type { SynthesizedCell } from "../synthesis";
export type { SynthesizedCell };

export abstract class Channel {
  protected readonly gain: GainNode;
  protected readonly gate: GainNode;

  constructor(masterGain: GainNode, audioContext: AudioContext) {
    this.gain = new GainNode(audioContext, { gain: 0 });
    this.gate = new GainNode(audioContext, { gain: 1 });

    this.gain.connect(this.gate);
    this.gate.connect(masterGain);
  }

  public abstract start(): void;

  public abstract scheduleCell(cell: SynthesizedCell, time: number): void;

  public abstract silence(time: number): void;

  public muteAtTime(time: number): void {
    this.gate.gain.setValueAtTime(0, time);
  }

  public unmuteAtTime(time: number): void {
    this.gate.gain.setValueAtTime(1, time);
  }

  public setVolumeAtTime(volume: number, time: number): void {
    if (volume >= 0 && volume <= 1) {
      this.gain.gain.setValueAtTime(volume, time);
    }
  }

  public cancelScheduledGainValues(time: number): void {
    this.gain.gain.cancelScheduledValues(time);
  }
}
