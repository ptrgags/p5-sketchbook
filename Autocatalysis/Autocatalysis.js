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

const REACTION = new ReactionDiffusion({
  constant_rates: {
    A: 0,
    B: 0,
    C: 0,
    D: 0
  },
  linear_scale: 1,
  linear_rates: [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
  ],
  diffusion_rates: {
    A: 0.0,
    B: 0.0,
    C: 0.0,
    D: 0.0
  }
});

const SEASHELL = new SeashellTexture({
  reaction_diffusion: REACTION,
  max_width: WIDTH,
  max_height: HEIGHT,
  palette: PALETTE
});

const READ = 0;
const WRITE = 1;
const ITERATIONS_PER_FRAME = 10;
const DELTA_TIME = 1;
const REVERSAL_ENABLED = true;
const REVERSAL_FRAMES = 31;
const SHIFT_ENABLED = true;
const SHIFT_FRAMES = 4;

let shift_amount = 0;

let shell_img;
function setup() {
  createCanvas(2 * WIDTH, HEIGHT);
  shell_img = createGraphics(WIDTH, HEIGHT);
}

function draw() {
  background(BACKGROUND_COLOR);
  image(shell_img, 0, 0);
  
  push();
  translate(WIDTH, 0);
  SEASHELL.draw_phase_plot();
  pop();
  
  
  if (REVERSAL_ENABLED && frameCount % REVERSAL_FRAMES === 0) {
    SEASHELL.reverse_diffusion();
  } 
  
  if (SHIFT_ENABLED && shift_amount === 1) {
    shift_amount--;
  } else if (SHIFT_ENABLED && frameCount % SHIFT_FRAMES === 0) {
    shift_amount++;
  }
  
  SEASHELL.draw_shell(shell_img);
  
  
  SEASHELL.react(ITERATIONS_PER_FRAME);
  SEASHELL.deposit();
  SEASHELL.swap_buffers();
}
