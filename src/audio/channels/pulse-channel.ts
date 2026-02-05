import type { DutyValue } from "../duty";
import { getWaveShaperCurve } from "../wave-shaper";

export class PulseChannel {
  private readonly source: OscillatorNode;
  private readonly waveShaper: WaveShaperNode;
  private readonly gain: GainNode;
  private readonly gate: GainNode;

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    this.source = new OscillatorNode(audioContext, { type: "sawtooth" });
    this.waveShaper = new WaveShaperNode(audioContext, {
      curve: getWaveShaperCurve(0.5), // default to half-off, half-on pulse wave
    });
    this.gain = new GainNode(audioContext, { gain: 0 });
    this.gate = new GainNode(audioContext, { gain: 1 });

    // wire up the audio graph
    this.source.connect(this.waveShaper);
    this.waveShaper.connect(this.gain);
    this.gain.connect(this.gate);

    // finally, connect the output of the channel to the master gain node
    this.gate.connect(masterGain);
  }

  public start(): void {
    this.source.start();
  }

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

  public cancelScheduledFrequencyValues(time: number): void {
    this.source.frequency.cancelScheduledValues(time);
  }

  public setFrequencyAtTime(frequency: number, time: number): void {
    if (frequency >= 0) {
      this.source.frequency.setValueAtTime(frequency, time);
    }
  }

  public changeWaveShape(duty: DutyValue): void {
    if (duty !== -1) {
      this.waveShaper.curve = getWaveShaperCurve(duty);
    }
  }
}
