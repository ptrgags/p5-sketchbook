const WIDTH = 500;
const HEIGHT = 700;

const BACKGROUND_COLOR = "#cee0dc"; 
const PALETTE = {
  A: "#57467b", // grape
  B: "#303a2b", // dark green
  C: "#f18f01", // orange
  D: "#a5243d" // burgandy
};

function generate_concentration() {
  return {
    A: Math.random(),
    B: Math.random(),
    C: Math.random(),
    D: 0
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
  new ChemicalEquation("A + B -> C", 1, 1),
  new ChemicalEquation("2C -> D + B", 1, 1),
  new ChemicalEquation("3D -> A", 1, 1),

  //new ChemicalEquation("C + A <-> B", 1.1, 1),
  //new ChemicalEquation("B + C <-> A", 1, 1.1),
  //new ChemicalEquation("A + B <-> C", 1.1, 1),
  
  //new ChemicalEquation("A + B + C + D <-> 4B", 1, 0.2)
];

const CHEMICALS = init_chemicals();
function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(BACKGROUND_COLOR);
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

function display_chemical(x, y, concentrations) {
  const [chemical, max_concentration] = Object.entries(concentrations).reduce((a, b) => {
    const [chemical_a, value_a] = a;
    const [chemical_b, value_b] = b;
    if (value_a >= value_b) {
      return a;
    }
    return b;
  });
  
  const chemical_color = color(PALETTE[chemical]);
  
  noFill();
  stroke(PALETTE[chemical]);
  point(x, y);
}

function display_chemicals(y) {
  for (let i = 0; i < WIDTH; i++) {
    display_chemical(i, y, CHEMICALS[i]);
  }
}

const DELTA_TIME = 0.1;

function draw() {
  if (frameCount > HEIGHT) {
    return;
  }
  
  display_chemicals(frameCount - 1);
  
  update_chemicals(DELTA_TIME);
}
