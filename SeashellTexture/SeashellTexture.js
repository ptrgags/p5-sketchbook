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


function setup() {
  createCanvas(W, H);
  
  initial_conditions();
  background(0);
}

const ITERS_PER_UPDATE = 12; // iterations per call of draw();
const DELTA_TIME = 1;
const DELTA_X = 1;
const ACTIVATOR_DIFFUSION = 0.015; // Diffusion of the activator (D_a)
const ACTIVATOR_DECAY = 0.1; // Decay rate of the activator (mu)
const INITIAL_CATALYZATION = 0; // Initial amount of catalyzation (rho_0)
const INHIBITOR_PRODUCTION = 0; // Basic production of the inhibitor (rho)
const INHIBITOR_DIFFUSION = 0; // Diffusion of inhibitor (D_h)
const INHIBITOR_CONSTANT = 0.1; // Michaelis-Menten constant of inhibition (h_0)
const INHIBITOR_DECAY = 0.014; // Decay rate of the inhibitor (nu)
const HORMONE_PRODUCTION = 0.1; // Production rate of the hormone (rho') 
const HORMONE_DECAY = 0.1; // Decay rate of the hormone (eta)
const SATURATION = 0.25; // Saturation of the autocatalysis (k)

function update() {
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
    const saturation_factor = a * a / (1 + SATURATION * a * a);
    
    const da =
      catalysis_rate / (h + INHIBITOR_CONSTANT) * (saturation_factor + INITIAL_CATALYZATION) +
      -ACTIVATOR_DECAY * a +
      ACTIVATOR_DIFFUSION * laplacian_a;
    const dh =
      INHIBITOR_PRODUCTION +
      catalysis_rate * saturation_factor +
      -INHIBITOR_DECAY / c * h +
      INHIBITOR_DIFFUSION * laplacian_h;
    
    // write the new values of the activator and inhibitor
    activator[WRITE][i + 1] = a + da * DELTA_TIME;
    inhibitor[WRITE][i + 1] = h + dh * DELTA_TIME;
    
    // update the total activator for the hormone equation
    activator_sum += a * DELTA_X;
  } 
  
  // The hormone increases if there is a lot of activator
  // around, and decays over time.
  const dc = 
    HORMONE_PRODUCTION * activator_sum / W +
    -HORMONE_DECAY * c;
  hormone[WRITE] = c + dc * DELTA_TIME;
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
  
  stroke(255);
  strokeWeight(2);
  line(0, row, width, row);
  
  stroke(255, 0, 0);
  for (let i = 0; i < W; i++) {
    const a = activator[READ][i + 1];
    if (a > 0.5) {
      point(i, row);  
    }
  }
  
  for (let i = 0; i < ITERS_PER_UPDATE; i++) {
    update();
    ping_pong();
  }
}
