const EPSILON = 1e-8;

// This isn't a great way to check for float almost-equal, but it's good-enough for now.
export function is_nearly(x, y) {
  return Math.abs(x - y) < EPSILON;
}
