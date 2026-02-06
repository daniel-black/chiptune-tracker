export function padNumber(num: number): string {
  if (num < 10) return `0${num}`;
  return num.toString();
}

export function nowIso() {
  return new Date().toISOString();
}
