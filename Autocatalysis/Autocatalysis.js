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

const REACTION = new ReactionDiffusion({
});

const SEASHELL = new SeashellTexture({
  reaction_diffusion: REACTION,
  max_width: WIDTH,
  max_height: HEIGHT,
  palette: PALETTE
});

const READ = 0;
const WRITE = 1;
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

function draw() {
  background(BACKGROUND_COLOR);
  image(texture, 0, 0);
  
  push();
  translate(WIDTH, 0);
  SEASHELL.draw_phase_plot();
  pop();
  
  
  if (REVERSAL_ENABLED && frameCount % REVERSAL_FRAMES === 0) {
    scale_concentrations(DIFFUSION_RATES, -1);
  }
  
  if (SHIFT_ENABLED && shift_amount === 1) {
    shift_amount--;
  } else if (SHIFT_ENABLED && frameCount % SHIFT_FRAMES === 0) {
    shift_amount++;
  }
  
  SEASHELL.draw_shell();
  
  
  SEASHELL.react(ITERATIONS_PER_FRAME);
  SEASHELL.deposit();
}
