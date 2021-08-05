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
