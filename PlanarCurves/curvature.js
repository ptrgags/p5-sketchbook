function signed_random() {
  return 2 * random() - 1;
}

// Produces a circle
function constant_curvature(s) {
  return 0.01;
  
}

function linear_curvature(s) {
  return 0.001 * s;
}

let curr_rand_curvature = 0.0;
function random_curvature(s) {
  curr_rand_curvature += signed_random();
  return inverse_curvature(s) * curr_rand_curvature;
}

function inverse_curvature(s) {
  return (1 / (s + 0.001));
}
