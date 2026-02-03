// Acceptable volume levels are 0 (silent) to 15 (full volume)
const volumeEntries = [
  [0, 0],
  [1, 0.066],
  [2, 0.133],
  [3, 0.2],
  [4, 0.266],
  [5, 0.333],
  [6, 0.4],
  [7, 0.466],
  [8, 0.533],
  [9, 0.6],
  [10, 0.666],
  [11, 0.733],
  [12, 0.8],
  [13, 0.866],
  [14, 0.933],
  [15, 1],
] as const;

export type VolumeLevel = (typeof volumeEntries)[number][0];

function isVolumeLevel(num: number): num is VolumeLevel {
  return num >= 0 && num <= 15 && Number.isInteger(num);
}

const volumeMap = new Map<VolumeLevel, number>(volumeEntries);

export function getVolume(volumeString: string): number {
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

  const volume = volumeMap.get(parsedVolumeLevel);

  if (volume === undefined) {
    throw new Error(
      `Unable to get volume from volume level (${parsedVolumeLevel})`,
    );
  }

  return volume;
}
