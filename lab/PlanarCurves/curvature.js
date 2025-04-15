export function signed_random() {
  return 2 * Math.random() - 1;
}

// Produces a circle
export function constant_curvature(s) {
  return 0.01;
}

export function linear_curvature(s) {
  return 0.001 * s;
}

let curr_random_curvature = 0.0;
export function random_walk_curvature(s) {
  curr_random_curvature += signed_random();
  return (1 / (s + 0.001)) * curr_random_curvature;
}

export function inverse_curvature(s) {
  return 1 / (s + 0.001);
}
