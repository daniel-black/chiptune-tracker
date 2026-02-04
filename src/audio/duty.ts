const dutyEntries = [
  ["12", 0.125],
  ["25", 0.25],
  ["50", 0.5],
  ["75", 0.75],
] as const;

export type Duty = (typeof dutyEntries)[number][0];
export type DutyValue = (typeof dutyEntries)[number][1];

const dutyValueMap = new Map<Duty, DutyValue>(dutyEntries);

function isDuty(duty: string): duty is Duty {
  return dutyValueMap.has(duty as Duty);
}

export function getDutyValue(duty: string): DutyValue {
  if (!isDuty(duty)) {
    throw new Error(`Invalid duty (${duty}) passed to getDuty`);
  }

  const dutyValue = dutyValueMap.get(duty);

  if (dutyValue === undefined) {
    throw new Error(`Invalid duty (${duty}) passed to getDuty`);
  }

  return dutyValue;
}
