// converts a decimal amount to an integer count of cents.
// keeps multiplication and summation exact, avoiding float drift.
// storage and the API stay decimal; only arithmetic ever uses cents.
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}
