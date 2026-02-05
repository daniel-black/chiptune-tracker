export class NoiseChannel {
  private readonly audioContext: AudioContext;
  private readonly source: AudioBufferSourceNode;
  private readonly gain: GainNode;
  private readonly gate: GainNode;

  constructor(audioContext: AudioContext, masterGain: GainNode) {
    this.audioContext = audioContext;

    const buffer = this.createBuffer(audioContext);

    this.source = new AudioBufferSourceNode(audioContext, {
      buffer,
      loop: true,
    });
    this.gain = new GainNode(audioContext, { gain: 0 });
    this.gate = new GainNode(audioContext, { gain: 1 });

    // wire up audio graph
    this.source.connect(this.gain);
    this.gain.connect(this.gate);

    // connect output to master gain node
    this.gate.connect(masterGain);
  }

  public start(): void {
    this.source.start();
  }

  public mute(): void {
    this.gate.gain.setValueAtTime(0, this.audioContext.currentTime);
  }

  public unmute(): void {
    this.gate.gain.setValueAtTime(1, this.audioContext.currentTime);
  }

  public setVolumeAtTime(volume: number, time: number): void {
    if (volume >= 0 && volume <= 1) {
      this.gain.gain.setValueAtTime(volume, time);
    }
  }

  public cancelScheduledGainValues(time: number): void {
    this.gain.gain.cancelScheduledValues(time);
  }

  public setRateAtTime(rate: number, time: number): void {
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
