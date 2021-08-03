const WIDTH = 500;
const HEIGHT = 700;

/*
const BACKGROUND_COLOR = "#cee0dc"; 
const PALETTE = {
  A: "#57467b", // grape
  B: "#303a2b", // dark green
  C: "#f18f01", // orange
  D: "#a5243d" // burgandy
};
*/


const BACKGROUND_COLOR = "#d7d9b1";
const PALETTE = {
  A: "#06aed5",
  B: "#ef8354",
  C: "#086788",
  D: "#493843",
};

function random_species() {
  const rand_index = Math.floor(4 * Math.random());
  const species = CHEMICAL_SYMBOLS[rand_index];
  const result = empty_concentrations();
  result[species] = Math.random();
  return result;
}

function generate_concentration() {
  return {
    A: Math.random(),
    B: Math.random(),
    C: Math.random(),
    D: Math.random()
  };
}

let prev_a = 0, prev_b = 0, prev_c = 0, prev_d = 0;
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
  }
}

function init_chemicals() {
  const chemicals = new Array(WIDTH);
  for (let i = 0; i < WIDTH; i++) {
    chemicals[i] = aggregate_concentration();
    //chemicals[i] = generate_concentration();
    //chemicals[i] = cycle_species(i);
  }
  return chemicals;
}

const CONSTANT_RATES = {
  A: 0,
  B: 0,
  C: 0,
  D: 0
};

const LINEAR_SCALE = -0.01;
const LINEAR_RATES = [
  0, 1, 0, 0,
  1, 0, 0, 0,
  0, 0, 1, 1,
  0, 0, 0, 0,
];

const DIFFUSION_RATES = {
  A: 0.01,
  B: 0.01,
  C: 0.01,
  D: 0.01
};

const EQUATIONS = [
  //new ChemicalEquation("C <-> D", 0.1, 0.01),
  //new ChemicalEquation("A + B -> 2B", 0.1, 1),
  //new ChemicalEquation("2A -> B", 0.001, 0.01),
  //new ChemicalEquation("2B -> C", 0.001, 0.01),
  //new ChemicalEquation("2C -> D", 0.001, 0.01),
  //new ChemicalEquation("2D -> A", 0.001, 0.01),
  //new ChemicalEquation("A + B + C + D -> 5A", 0, 1),
  //new ChemicalEquation("3B + 2C -> 2C", 2, 1),
  
  //new ChemicalEquation("A + B <-> C", 0.1, 0.5),
  
  //new ChemicalEquation("B + C -> 2B", 0.5, 1), 

  //new ChemicalEquation("3B + 2C -> 2C", 2, 1),
  //new ChemicalEquation("A -> A", 1, 1),

  //new ChemicalEquation("A + B -> C", 1, 1),
  //new ChemicalEquation("B + C -> D", 1, 1),
  //new ChemicalEquation("C + D -> A", 1, 1),
  //new ChemicalEquation("D + A -> B", 1, 1),
  
  //new ChemicalEquation("A -> A", 1, 1),
  //new ChemicalEquation("3A -> B", 0.1, 1),
  //new ChemicalEquation("B + 2C -> 3A", 1, 1),
  
  
  //new ChemicalEquation("5A -> C", 1, 1),
  //new ChemicalEquation("2A + C -> B", 1, 1),
  //new ChemicalEquation("2B + D -> A", 1, 1),
  //new ChemicalEquation("10D -> 9D", 1, 1)
  
  
  /*
  new ChemicalEquation("A + B + C -> D", 1, 1),
  new ChemicalEquation("5D -> A + B", 1, 1),
  */

/*
  new ChemicalEquation("A + B -> C", 1, 1),
  new ChemicalEquation("2C -> D + B", 1, 1),
  new ChemicalEquation("3D -> A", 1, 1),
  */
 

  //new ChemicalEquation("C + A <-> B", 1.1, 1),
  //new ChemicalEquation("B + C <-> A", 1, 1.1),
  //new ChemicalEquation("A + B <-> C", 1.1, 1),
  
  //new ChemicalEquation("A + B + C + D <-> 4B", 1, 0.2)
];

const READ = 0;
const WRITE = 1;
const CHEMICALS = [init_chemicals(), init_chemicals()];
const ITERATIONS_PER_FRAME = 4;
const DELTA_TIME = 1;
const REVERSAL_ENABLED = true;
const REVERSAL_FRAMES = 31;
const SHIFT_ENABLED = true;
const SHIFT_FRAMES = 4;

let shift_amount = 0;

let texture;
function setup() {
  createCanvas(2 * WIDTH, HEIGHT);
  texture = createGraphics(WIDTH, HEIGHT);
}

function empty_concentrations() {
  return {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  };
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

function diffusion(left, middle, right, rates) {
  const diffusion_term = laplacian(left, middle, right);
  scale_concentrations(diffusion_term, rates);
}

function handle_negatives(concentrations) {
  concentrations.A = Math.abs(concentrations.A);
  concentrations.B = Math.abs(concentrations.B);
  concentrations.C = Math.abs(concentrations.C);
  concentrations.D = Math.abs(concentrations.D);
}

function update_chemicals(delta_time) {
  // Swap buffers.
  [CHEMICALS[READ], CHEMICALS[WRITE]] = [CHEMICALS[WRITE], CHEMICALS[READ]];
  
  const read_buffer = CHEMICALS[READ];
  const write_buffer = CHEMICALS[WRITE];
  for (let i = 0; i < WIDTH; i++) {
    const left_index = Math.max(i - 1, 0);
    const right_index = Math.min(i + 1, WIDTH - 1);
    const left_neighbor = read_buffer[(left_index + shift_amount) % WIDTH];
    const input = read_buffer[(i + shift_amount) % WIDTH];
    const right_neighbor = read_buffer[(right_index + shift_amount) % WIDTH];
    const output = write_buffer[i];
    
    // time derivatives of each concentration
    const derivatives = empty_concentrations();
    
    // Reaction terms
    for (const equation of EQUATIONS) {
      const reaction_terms = equation.compute_changes(input);
      add_concentrations(derivatives, reaction_terms);
    }
    
    // diffusion terms
    // dx = D * laplacian(x)
    const diffusion_terms = laplacian(left_neighbor, input, right_neighbor);
    multiply_concentrations(diffusion_terms, DIFFUSION_RATES);
     
    add_concentrations(derivatives, diffusion_terms);
    
    // Exponential growth/decay and other linear terms
    const linear_terms = linear_transform(input, LINEAR_RATES);
    scale_concentrations(linear_terms, LINEAR_SCALE);
    add_concentrations(derivatives, linear_terms);
    
    // Exponential growth/decay
    //const exponential_terms = clone(input);
    //multiply_concentrations(exponential_terms, EXPONENTIAL_RATES);
    //add_concentrations(derivatives, exponential_terms);
    
    // Constant addition/removal
    add_concentrations(derivatives, CONSTANT_RATES);
    
    // Euler's Method
    // output = input + dt * derivatives
    scale_concentrations(output, 0);
    add_concentrations(output, input);
    scale_concentrations(derivatives, delta_time);
    add_concentrations(output, derivatives);
    
    // Reflect negative values
    handle_negatives(output);
  }
}

function get_max_concentration(concentrations) {
  return Object.entries(concentrations).reduce((a, b) => {
    const [chemical_a, value_a] = a;
    const [chemical_b, value_b] = b;
    if (value_a >= value_b) {
      return a;
    }
    return b;
  });
}

function display_chemical(x, y, concentrations) {
  const [chemical, max_concentration] = get_max_concentration(concentrations);
  const chemical_color = color(PALETTE[chemical]);
  
  texture.noFill();
  texture.stroke(PALETTE[chemical]);
  texture.point(x, y);
}

// map (-inf, inf) into the range [0, 1].
// Negative values are flipped
function tone_map(x) {
  x = Math.abs(x);
  return x / (1 + x);
}

function display_blended(x, y, concentrations) {
  const a = tone_map(concentrations.A);
  const b = tone_map(concentrations.B);
  const c = tone_map(concentrations.C);
  const d = tone_map(concentrations.D);
  const weights = [a, b, c, d];
  
  const a_color = color(PALETTE.A);
  const b_color = color(PALETTE.B);
  const c_color = color(PALETTE.C);
  const d_color = color(PALETTE.D);
  const colors = [a_color, b_color, c_color, d_color];
  
  let avg_r = 0;
  let avg_g = 0;
  let avg_b = 0;
  for (let i = 0; i < 4; i++) {
    const c = colors[i];
    for (let j = 0; j < 4; j++) {
      avg_r += weights[j] * red(c);
      avg_g += weights[j] * green(c);
      avg_b += weights[j] * blue(c);
    }
  }
  avg_r /= 4.0;
  avg_g /= 4.0;
  avg_b /= 4.0;
  
  texture.noFill();
  texture.stroke(color(avg_r, avg_g, avg_b));
  texture.point(x, y);
}

function display_chemicals(y) {
  for (let i = 0; i < WIDTH; i++) {
    //display_chemical(i, y, CHEMICALS[READ][i]);
    display_blended(i, y, CHEMICALS[READ][i]);
  }
}

function display_concentration_phase(concentrations) {
  const a = concentrations.A;
  const b = concentrations.B;
  const c = concentrations.C;
  const d = concentrations.D;
  let total = a + b + c + d;
  if (total === 0) {
    total = 0;
  }
  const weight_a = a / total;
  const weight_b = b / total;
  const weight_c = c / total;
  const weight_d = d / total;
  
  const [ax, ay] = [0, 0];
  const [bx, by] = [0, WIDTH];
  const [cx, cy] = [WIDTH, WIDTH];
  const [dx, dy] = [WIDTH, 0];
  
  const x = weight_a * ax + weight_b * bx + weight_c * cx + weight_d * dx;
  const y = weight_a * ay + weight_b * by + weight_c * cy + weight_d * dy;
  
  // TODO: What's the best way to distinguish even distributions from skewed ones?
  const max_weight = Math.max(weight_a, weight_b, weight_c, weight_d);
  stroke(max_weight * 255);
  point(x, y);
}

function display_phase_plot() {
  noFill();
  stroke(0);
  push();
  translate(WIDTH, 0);
  
  noStroke();
  fill(PALETTE.A);
  rect(0, 0, WIDTH / 2, WIDTH / 2);
  fill(PALETTE.B);
  rect(0, WIDTH / 2, WIDTH / 2, WIDTH / 2);
  fill(PALETTE.C);
  rect(WIDTH / 2, WIDTH / 2, WIDTH / 2, WIDTH / 2);
  fill(PALETTE.D);
  rect(WIDTH / 2, 0, WIDTH / 2, WIDTH / 2);
  
  noStroke();
  fill(255);
  textSize(20);
  textAlign(LEFT, TOP);
  text("A", 0, 0);
  textAlign(LEFT, BASELINE);
  text("B", 0, WIDTH);
  textAlign(RIGHT, BASELINE);
  text("C", WIDTH, WIDTH);
  textAlign(RIGHT, TOP);
  text("D", WIDTH, 0);
  
  
  noFill();
  strokeWeight(4);
  for (const concentrations of CHEMICALS[READ]) {
    display_concentration_phase(concentrations);
  }
  
  pop();
}



function draw() {
  background(BACKGROUND_COLOR);
  image(texture, 0, 0);
  display_phase_plot();
  
  if (REVERSAL_ENABLED && frameCount % REVERSAL_FRAMES === 0) {
    scale_concentrations(DIFFUSION_RATES, -1);
  }
  
  if (SHIFT_ENABLED && shift_amount === 1) {
    shift_amount--;
  } else if (SHIFT_ENABLED && frameCount % SHIFT_FRAMES === 0) {
    shift_amount++;
  }
  
  
  if (frameCount <= HEIGHT) {
    display_chemicals(frameCount - 1);
  }
  
  for (let i = 0; i < ITERATIONS_PER_FRAME; i++) {
    update_chemicals(DELTA_TIME);
  }
}
