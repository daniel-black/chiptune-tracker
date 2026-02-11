import type { DutyValue } from "../characteristics/duty";
import { getWaveShaperCurve } from "../wave-shaper";
import { Channel, type SynthesizedCell } from "./channel";

const dutyValues = [0.125, 0.25, 0.5, 0.75] as const;
const defaultDuty = 0.5;

export class PulseChannel extends Channel {
  private readonly source: OscillatorNode;
  private readonly dutyBranches: Map<number, GainNode>;

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    super(masterGain, audioContext);

    this.source = new OscillatorNode(audioContext, { type: "sawtooth" });

    // Create one waveshaper + gain pair per duty cycle
    this.dutyBranches = new Map();
    for (const duty of dutyValues) {
      const shaper = new WaveShaperNode(audioContext, {
        curve: getWaveShaperCurve(duty),
      });
      const branchGain = new GainNode(audioContext, {
        gain: duty === defaultDuty ? 1 : 0,
      });

      this.source.connect(shaper);
      shaper.connect(branchGain);
      branchGain.connect(this.gain);

      this.dutyBranches.set(duty, branchGain);
    }
  }

  public start(): void {
    this.source.start();
  }

  public scheduleCell(cell: SynthesizedCell, time: number): void {
    if (cell.kind !== "pulse") return;

    this.setFrequencyAtTime(cell.frequency, time);
    this.setDutyAtTime(cell.duty, time);
    this.setVolumeAtTime(cell.gain, time);
  }

  public silence(time: number): void {
    this.cancelScheduledGainValues(time);
    this.setVolumeAtTime(0, time);
    this.cancelScheduledFrequencyValues(time);
    this.setFrequencyAtTime(0, time);
    this.cancelScheduledDutyValues(time);
  }

  private cancelScheduledFrequencyValues(time: number): void {
    this.source.frequency.cancelScheduledValues(time);
  }

  private cancelScheduledDutyValues(time: number): void {
    for (const branchGain of this.dutyBranches.values()) {
      branchGain.gain.cancelScheduledValues(time);
    }
  }

  private setFrequencyAtTime(frequency: number, time: number): void {
    if (frequency >= 0) {
      this.source.frequency.setValueAtTime(frequency, time);
    }
  }

  private setDutyAtTime(duty: DutyValue, time: number): void {
    if (duty === -1) return;

    for (const [dutyValue, branchGain] of this.dutyBranches) {
      branchGain.gain.setValueAtTime(dutyValue === duty ? 1 : 0, time);
    }
  }
}
