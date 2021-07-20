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

function gamepad_curvature(s) {
  const LEFT_STICK_X = 0;
  const left_stick = GAMEPAD.axes[LEFT_STICK_X];
  
  // TODO: modify the amplitude with the right stick somehow
  //const RIGHT_STICK_Y = 3;
  //const right_stick = GAMEPAD.axes[RIGHT_STICK_Y];
  return left_stick;
}

function pointer_curvature(s) {
  //const magnitude = pointer.pressure;
  const [x, y] = pointer.tilt_direction;
  //const sign = Math.sign(x);
  return x;
}

function midi_curvature(s) {
  const normalized = MIDI.cc_value / 127;
  const signed = 2 * normalized - 1;
  return signed;
}
