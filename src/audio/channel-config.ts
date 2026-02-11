export type ChannelKind = "pulse" | "noise";

export type ChannelConfigEntry = {
  readonly kind: ChannelKind;
  readonly name: string;
  readonly fieldCount: number;
};

export const CHANNEL_CONFIG: readonly ChannelConfigEntry[] = [
  { kind: "pulse", name: "Channel 1", fieldCount: 3 },
  { kind: "pulse", name: "Channel 2", fieldCount: 3 },
  { kind: "pulse", name: "Channel 3", fieldCount: 3 },
  { kind: "noise", name: "Noise", fieldCount: 2 },
];

export const CHANNEL_COUNT = CHANNEL_CONFIG.length;
