import { Channel, type SynthesizedCell } from "./channel";

export class NoiseChannel extends Channel {
  private readonly source: AudioBufferSourceNode;

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    super(masterGain, audioContext);

    const buffer = this.createBuffer(audioContext);

    this.source = new AudioBufferSourceNode(audioContext, {
      buffer,
      loop: true,
    });

    // wire source to the gain stage from the base class
    this.source.connect(this.gain);
  }

  public start(): void {
    this.source.start();
  }

  public scheduleCell(cell: SynthesizedCell, time: number): void {
    if (cell.kind !== "noise") return;

    this.setRateAtTime(cell.rate, time);
    this.setVolumeAtTime(cell.gain, time);
  }

  public silence(time: number): void {
    this.cancelScheduledGainValues(time);
    this.setVolumeAtTime(0, time);
  }

  private setRateAtTime(rate: number, time: number): void {
    if (rate >= 0) {
      this.source.playbackRate.setValueAtTime(rate, time);
    }
  }

  private createBuffer(audioContext: AudioContext): AudioBuffer {
    // Create buffer for noise channel
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate,
    );
    const bufferData = buffer.getChannelData(0);

    // Initialize LFSR with all bits set to 1 (as GameBoy does)
    let lfsr = 0x7fff;

    // Fill the buffer with noise generated using LFSR
    for (let i = 0; i < bufferSize; i++) {
      // Get output bit (bit 0)
      const output = lfsr & 1;

      // Scale to [-1, 1] for audio (0 becomes -1, 1 becomes 1)
      bufferData[i] = output * 2 - 1;

      // Shift LFSR and apply feedback
      // XOR bits 0 and 1
      const bit0 = lfsr & 1;
      const bit1 = (lfsr >> 1) & 1;
      const newBit = bit0 ^ bit1;

      // Shift right by 1 and put new bit in position 15
      lfsr = (lfsr >> 1) | (newBit << 14);
    }

    return buffer;
  }
}
