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

const EQUATIONS = [
  //new ChemicalEquation("A <-> B", 1, 1),
  //new ChemicalEquation("A + B -> 2B", 0.1, 1),

  new ChemicalEquation("A + B -> C", 1, 1),
  new ChemicalEquation("B + C -> D", 1, 1),
  new ChemicalEquation("C + D -> A", 1, 1),
  new ChemicalEquation("D + A -> B", 1, 1),
  
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

const CHEMICALS = init_chemicals();
const ITERATIONS_PER_FRAME = 1;
const DELTA_TIME = 0.1;

let texture;
function setup() {
  createCanvas(2 * WIDTH, HEIGHT);
  texture = createGraphics(WIDTH, HEIGHT);
}

function empty_concentration() {
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

function scale_concentrations(concentrations, scalar) {
  concentrations.A *= scalar;
  concentrations.B *= scalar;
  concentrations.C *= scalar;
  concentrations.D *= scalar;
}

function update_chemicals(delta_time) {
  for (let i = 0; i < WIDTH; i++) {
    const current_concentrations = CHEMICALS[i];
    const total_diff = empty_concentration();
    for (const equation of EQUATIONS) {
      const diff = equation.compute_changes(current_concentrations);
      add_concentrations(total_diff, diff);
    }
    
    scale_concentrations(total_diff, delta_time);
    add_concentrations(current_concentrations, total_diff);
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
    display_chemical(i, y, CHEMICALS[i]);
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
  for (const concentrations of CHEMICALS) {
    display_concentration_phase(concentrations);
  }
  
  pop();
}



function draw() {
  background(BACKGROUND_COLOR);
  image(texture, 0, 0);
  display_phase_plot();
  
  if (frameCount > HEIGHT) {
    return;
  }
  
  display_chemicals(frameCount - 1);
  
  for (let i = 0; i < ITERATIONS_PER_FRAME; i++) {
    update_chemicals(DELTA_TIME);
  }
}
