import type { DutyValue } from "./duty";

const curveLength = 2048 as const;

export function createWaveShaperCurve(
  duty: DutyValue,
): Float32Array<ArrayBuffer> {
  const curve = new Float32Array(curveLength);

  for (let i = 0; i < curveLength; i++) {
    // Convert the index to a value between 0 and 1
    const x = i / (curveLength - 1);

    // Create a step function at the duty cycle point
    curve[i] = x < duty ? 1.0 : -1.0;
  }

  return curve;
}

// revisit this to see if Duty or DutyValue is the type that makes the most sense here

/**
 * Pre-computed wave shaper curves for standard duty cycles
 */
const waveShaperCurves: Record<number, Float32Array<ArrayBuffer>> = {
  0.125: createWaveShaperCurve(0.125),
  0.25: createWaveShaperCurve(0.25),
  0.5: createWaveShaperCurve(0.5),
  0.75: createWaveShaperCurve(0.75),
} as const;

/**
 * Get a wave shaper curve for a preset duty cycle (0.125, 0.25, 0.5, or 0.75)
 *
 * @param dutyCycle - The desired duty cycle (0.125, 0.25, 0.5, or 0.75)
 * @returns A Float32Array containing the wave shaper curve
 */
export function getWaveShaperCurve(dutyCycle: DutyValue) {
  if (dutyCycle < 0) {
    throw new Error("Disallow invalid duty cycle");
  }
  return waveShaperCurves[dutyCycle];
}
