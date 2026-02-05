// The playback rate for the noise channel.
// Range of values can be from '00' (0.0x speed) to '99' (9.9x speed).
// For the standard rate, enter '10' (1.0x speed).

// The value at the level of representation is a string like "00" or "54"
// The value at the level of audio synth needs to be decimal number like 0.0 or 5.4
// "12" -> 1.2 just means play the noise channel at 1.2x the normal rate

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Generates a union of "00" | "01" | ... | "99"
 */
export type Rate = `${Digit}${Digit}`;

export function getRateValue(rate: string): number {
  if (rate === "--") {
    return -1;
  }

  const parsedRate = parseInt(rate, 10);

  if (isNaN(parsedRate)) {
    throw new Error(`Invalid rate string: ${rate}`);
  }

  if (parsedRate < 0 || parsedRate > 99) {
    throw new Error(`Rate (${parsedRate}) out of range (00-99)`);
  }

  return parsedRate / 10;
}
