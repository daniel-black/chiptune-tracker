// Acceptable volume levels are 0 (silent) to 15 (full volume), mapped linearly to gain 0-1
export type VolumeLevel =
  0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

const maxVolumeLevel = 15;

export function isVolumeLevel(num: number): num is VolumeLevel {
  return num >= 0 && num <= maxVolumeLevel && Number.isInteger(num);
}

export function getVolume(volumeString: string): number {
  if (volumeString === "--") {
    return -1;
  }

  const parsedVolumeLevel = parseInt(volumeString, 10);

  if (isNaN(parsedVolumeLevel)) {
    throw new Error(
      `You passed a string (${volumeString}) that does not parse to a number to getVolume`,
    );
  }

  if (!isVolumeLevel(parsedVolumeLevel)) {
    throw new Error(
      `Volume level (${parsedVolumeLevel}) is out of allowed range (0-15)`,
    );
  }

  return parsedVolumeLevel / maxVolumeLevel;
}
