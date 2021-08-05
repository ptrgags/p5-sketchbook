function empty_concentrations() {
  return {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };
}

let prev_a = 0;
let prev_b = 0;
let prev_c = 0;
let prev_d = 0;
function aggregate_concentration() {
  const result = {
    A: (prev_a + Math.random()) / 2,
    B: (prev_b + Math.random()) / 2,
    C: (prev_c + Math.random()) / 2,
    D: (prev_d + Math.random()) / 2
  };
  
  prev_a = result.A;
  prev_b = result.B;
  prev_c = result.C;
  prev_d = result.D;
  return result;
}

function cycle_species(i) {
  return {
    A: (i % 2) * Math.random(),
    B: ((i % 3) % 2) * Math.random(),
    C: ((i % 5) % 2) * Math.random(),
    D: ((i % 7) % 2) * Math.random(),
  };
}

function set_concentrations(a, b) {
  a.A = b.A;
  a.B = b.B;
  a.C = b.C;
  a.D = b.D;
}

function add_concentrations(a, b) {
  a.A += b.A;
  a.B += b.B;
  a.C += b.C;
  a.D += b.D;
}

function multiply_concentrations(a, b) {
  a.A *= b.A;
  a.B *= b.B;
  a.C *= b.C;
  a.D *= b.D;
}

function scale_concentrations(concentrations, scalar) {
  concentrations.A *= scalar;
  concentrations.B *= scalar;
  concentrations.C *= scalar;
  concentrations.D *= scalar;
}

function clone(concentrations) {
  const result = empty_concentrations();
  result.A = concentrations.A;
  result.B = concentrations.B;
  result.C = concentrations.C;
  result.D = concentrations.D;
  return result;
}

function handle_negatives(concentrations) {
  concentrations.A = Math.abs(concentrations.A);
  concentrations.B = Math.abs(concentrations.B);
  concentrations.C = Math.abs(concentrations.C);
  concentrations.D = Math.abs(concentrations.D);
}

// TODO: why do these allocate the result?
function linear_transform(input, matrix) {
  const [
    a11, a12, a13, a14,
    a21, a22, a23, a24,
    a31, a32, a33, a34,
    a41, a42, a43, a44
  ] = matrix;
  const a = input.A;
  const b = input.B;
  const c = input.C;
  const d = input.D;
  
  const result = empty_concentrations();
  result.A = a11 * a + a12 * b + a13 * c + a14 * d;
  result.B = a21 * a + a22 * b + a23 * c + a24 * d;
  result.C = a31 * a + a32 * b + a33 * c + a34 * d;
  result.D = a41 * a + a42 * b + a43 * c + a44 * d;
  return result;
}

function laplacian(left, middle, right) {
  // laplacian f ~= left - 2 * middle + right;
  const sum = empty_concentrations();
  add_concentrations(sum, left);
  add_concentrations(sum, right);
  const weighted_middle = clone(middle);
  scale_concentrations(weighted_middle, -2);
  add_concentrations(sum, weighted_middle);
  return sum;
}
