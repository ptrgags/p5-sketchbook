/**
 * Seashell texture
 * Based on the '92 SIGGRAPH paper "Modeling seashells" by Fowler, Meinhardt and Prusinkiewicz
 * see here: http://algorithmicbotany.org/papers/shells.sig92.pdf
 * 
 * I also referred to the BASIC implementation Hans Meinhardt provides here: 
 * https://www.eb.tuebingen.mpg.de/emeriti/hans-meinhardt/shell-program/
 * though I updated it to use a modern buffer ping-pong approach and used more descriptive
 * variables.
 */

const W = 640;
const H = 480;

// the activator and inhibitor buffers
// span the width of the canvas
// with 2 border pixels. There are two of each
// for buffer ping-pong.
const READ = 0;
const WRITE = 1;
const activator = [
  new Array(W + 2).fill(0),
  new Array(W + 2).fill(0),
];
const inhibitor = [
  new Array(W + 2).fill(0.1),
  new Array(W + 2).fill(0.1)
];
// The hormone is constant across the ridge
// but again, let's ping-pong
const hormone = [
  0.5,
  0.5
];

const CONVERSION_RATE = new Array(W);
const FLUCTUATION_SCALE = 0.1;

// TODO: Explore other ways to seed the activator.
function initial_conditions() {
  for (let i = 0; i < W; i++) {
    CONVERSION_RATE[i] = FLUCTUATION_SCALE * (0.96 + 0.08 * random());
  }
  
  let i = 10;
  for (let j = 1; j < 30; j++) {
    // This is only used when initializing the
    // array
    activator[READ][int(i)] = 1;
    i += 100 * random() + 10;
    
    if (i > W) {
      break;
    }
  }
}

//const seashell = SeashellParameters.CONSTANT;
//const seashell = SeashellParameters.OLIVIA_PORPHYRIA;
const seashell = SeashellParameters.BLOCKY;

// for prototyping:
/*
const seashell = new SeashellParameters({
  iters_per_update: 2,
  initial_catalysis: 0.01,
  activator_diffusion: 0.01,
  activator_decay: 0.02,
  inhibitor_production: 0.01,
  inhibitor_diffusion: 0.2,
  inhibitor_decay: 0.01,
  inhibitor_constant: 0.1,
  hormone_production: 0.1,
  hormone_decay: 0.1,
  // olive green
  substrate_color: [0xF4, 0x74, 0x3B], 
  // somewhere between purple and navy
  pigment_color: [0x88, 0x16, 0x00], 
  //saturation: 0.001
});
*/

function setup() {
  createCanvas(W, H);
  
  initial_conditions();
  background(0);
}

function update(seashell) {
  // for the summation term in the hormone equation
  let activator_sum = 0;
  
  // set the border pixels to a copy of the left/right-most values
  // this prevents diffusion through the border
  activator[READ][0] = activator[READ][1];
  inhibitor[READ][0] = inhibitor[READ][1];
  activator[READ][W + 1] = activator[READ][W];
  inhibitor[READ][W + 1] = inhibitor[READ][W];
  
  // read the current hormone value, we'll need it later.
  const c = hormone[READ]; 
  
  for (let i = 0; i < W; i++) {
    // Both the activator and inhibitor diffuse across the ridge of
    // the shell. look up activator and inhibitor values, and compute
    // the laplacians of each for the diffusion term.
    const a_left = activator[READ][i];
    const a = activator[READ][i + 1];
    const a_right = activator[READ][i + 2];
    const laplacian_a = a_left + a_right - 2 * a;
    const h_left = inhibitor[READ][i];
    const h = inhibitor[READ][i + 1];
    const h_right = inhibitor[READ][i + 2];
    const laplacian_h = h_left + h_right - 2 * h;
    
    const catalysis_rate = CONVERSION_RATE[i];
    const saturation_factor = a * a / (1 + seashell.saturation * a * a);
    
    // change in activator da/dt
    // See equations (9) in the paper (http://algorithmicbotany.org/papers/shells.sig92.pdf)
    const da =
      catalysis_rate / (h + seashell.inhibitor_constant) * (saturation_factor + seashell.initial_catalysis) +
      -seashell.activator_decay * a +
      seashell.activator_diffusion * laplacian_a;
      
    // change in inhibitor dh/dt
    const dh =
      seashell.inhibitor_production +
      catalysis_rate * saturation_factor +
      -seashell.inhibitor_decay / c * h +
      seashell.inhibitor_diffusion * laplacian_h;
    
    // write the new values of the activator and inhibitor
    activator[WRITE][i + 1] = a + da * seashell.delta_time;
    inhibitor[WRITE][i + 1] = h + dh * seashell.delta_time;
    
    // update the total activator for the hormone equation
    activator_sum += a * seashell.delta_x;
  } 
  
  // The hormone increases if there is a lot of activator
  // around, and decays over time.
  const dc = 
    seashell.hormone_production * activator_sum / W +
    -seashell.hormone_decay * c;
  hormone[WRITE] = c + dc * seashell.delta_time;
}

function ping_pong() {
  [activator[READ], activator[WRITE]] = [activator[WRITE], activator[READ]];
  [inhibitor[READ], inhibitor[WRITE]] = [inhibitor[WRITE], inhibitor[READ]];
  [hormone[READ], hormone[WRITE]] = [hormone[WRITE], hormone[READ]];
}

function draw() {
  const row = frameCount - 1;
  if (row >= H) {
    return;
  }
  
  stroke(...seashell.substrate_color);
  strokeWeight(2);
  line(0, row, width, row);
  
  stroke(...seashell.pigment_color);
  for (let i = 0; i < W; i++) {
    const a = activator[READ][i + 1];
    if (a > 0.5) {
      point(i, row);  
    }
  }
  
  for (let i = 0; i < seashell.iters_per_update; i++) {
    update(seashell);
    ping_pong();
  }
}
