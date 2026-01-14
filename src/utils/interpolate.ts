/**
 * Interpolates a value between two numeric ranges.
 *
 * Maps `value` from [fromStart, fromEnd] to [toStart, toEnd].
 * Works with inverted ranges, negative values, and any numeric input.
 */
export function interpolate({
  value,
  fromStart,
  fromEnd,
  toStart,
  toEnd,
}: {
  value: number;
  fromStart: number;
  fromEnd: number;
  toStart: number;
  toEnd: number;
}): number {
  // Explicit and predictable: avoid division by zero.
  if (fromStart === fromEnd) return toStart;

  const t = (value - fromStart) / (fromEnd - fromStart);
  return toStart + t * (toEnd - toStart);
}
