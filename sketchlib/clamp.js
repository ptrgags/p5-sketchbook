export function clamp(x, min_val, max_val) {
  return Math.max(Math.min(x, max_val), min_val);
}
