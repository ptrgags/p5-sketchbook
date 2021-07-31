const WIDTH = 500;
const HEIGHT = 700;

const BACKGROUND_COLOR = "#cee0dc"; 
const PALETTE = {
  A: "#57467b", // grape
  B: "#303a2b", // dark green
  C: "#f18f01", // orange
  D: "#a5243d" // burgandy
};

const rand_value = Math.random();
function generate_concentration() {
  return {
    A: Math.random(),
    B: Math.random(),
    C: Math.random(),
    D: Math.random()
  };
}

function init_chemicals() {
  const chemicals = new Array(WIDTH);
  for (let i = 0; i < WIDTH; i++) {
    chemicals[i] = generate_concentration();
  }
  return chemicals;
}

const CONSTANT_RATES = {
  A: 0,
  B: 0,
  C: 0,
  D: 0
};

const EXPONENTIAL_RATES = {
  A: 0,
  B: 0,
  C: 0,
  D: 0
};

const DIFFUSION_RATES = {
  A: 0.4,
  B: 0.4,
  C: 0.4,
  D: 0.4
};

const EQUATIONS = [
  //new ChemicalEquation("A <-> B", 1, 1),
  //new ChemicalEquation("A + B -> 2B", 0.1, 1),
  new ChemicalEquation("A -> B", 0.01, 0.01),
  new ChemicalEquation("B -> C", 0.01, 0.01),
  new ChemicalEquation("C -> D", 0.01, 0.01),
  new ChemicalEquation("D -> A", 0.01, 0.01),
  //new ChemicalEquation("A + B + C + D -> A", 1, 1),
  
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
const ITERATIONS_PER_FRAME = 10;
const DELTA_TIME = 0.1;

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

function diffusion(left, middle, right, rates) {
  const diffusion_term = laplacian(left, middle, right);
  scale_concentrations(diffusion_term, rates);
}

function update_chemicals(delta_time) {
  // Swap buffers.
  [CHEMICALS[READ], CHEMICALS[WRITE]] = [CHEMICALS[WRITE], CHEMICALS[READ]];
  
  const read_buffer = CHEMICALS[READ];
  const write_buffer = CHEMICALS[WRITE];
  for (let i = 0; i < WIDTH; i++) {
    const left_index = Math.max(i - 1, 0);
    const right_index = Math.min(i + 1, WIDTH - 1);
    const left_neighbor = read_buffer[left_index];
    const input = read_buffer[i];
    const right_neighbor = read_buffer[right_index];
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
    
    // Exponential growth/decay
    const exponential_terms = clone(input);
    multiply_concentrations(exponential_terms, EXPONENTIAL_RATES);
    add_concentrations(derivatives, exponential_terms);
    
    // Constant addition/removal
    add_concentrations(derivatives, CONSTANT_RATES);
    
    // Euler's Method
    // output = input + dt * derivatives
    scale_concentrations(output, 0);
    add_concentrations(output, input);
    scale_concentrations(derivatives, delta_time);
    add_concentrations(output, derivatives);
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

function display_chemicals(y) {
  for (let i = 0; i < WIDTH; i++) {
    display_chemical(i, y, CHEMICALS[READ][i]);
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
  
  if (frameCount <= HEIGHT) {
    display_chemicals(frameCount - 1);
  }
  
  
  
  for (let i = 0; i < ITERATIONS_PER_FRAME; i++) {
    update_chemicals(DELTA_TIME);
  }
}
