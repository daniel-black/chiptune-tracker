import type { Duty } from "../types";

export function getDuty(duty: string): Duty {
  if (duty === "12") return 0.125;
  if (duty === "25") return 0.25;
  if (duty === "50") return 0.5;
  if (duty === "75") return 0.75;

  throw new Error(`Invalid duty (${duty}) passed to getDuty`);
}
