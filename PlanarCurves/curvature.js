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


let curr_random_curvature = 0.0;
function random_walk_curvature(s) {
  curr_random_curvature += signed_random();
  return (1 / (s + 0.001)) * curr_random_curvature;
};

function inverse_curvature(s) {
  return (1 / (s + 0.001));
}
