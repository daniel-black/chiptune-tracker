export function getRate(rateString: string): number {
  const parsedRate = parseInt(rateString, 10);

  if (isNaN(parsedRate)) {
    throw new Error(`Invalid rate string: ${rateString}`);
  }

  if (parsedRate < 0 || parsedRate > 99) {
    throw new Error(`Rate (${parsedRate}) out of range (00-99)`);
  }

  return parsedRate / 10;
}
