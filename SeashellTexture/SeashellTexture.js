import { SeashellParameters } from "./SeashellParameters.js";

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

const W = 500;
const H = 700;

// the activator and inhibitor buffers
// span the width of the canvas
// with 2 border pixels. There are two of each
// for buffer ping-pong.
const READ = 0;
const WRITE = 1;

function initial_conditions(state) {
  const { conversion_rate, fluctuation_scale, activator } = state;

  for (let i = 0; i < W; i++) {
    conversion_rate[i] = fluctuation_scale * (0.96 + 0.08 * Math.random());
  }

  let i = 10;
  for (let j = 1; j < 30; j++) {
    // This is only used when initializing the array
    activator[READ][i] = 1;
    i += 100 * Math.random() + 10;
    i = Math.round(i);

    if (i > W) {
      break;
    }
  }
}

function update(state) {
  const { activator, inhibitor, hormone, conversion_rate, seashell } = state;

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

    const catalysis_rate = conversion_rate[i];
    const saturation_factor = (a * a) / (1 + seashell.saturation * a * a);

    // change in activator da/dt
    // See equations (9) in the paper (http://algorithmicbotany.org/papers/shells.sig92.pdf)
    const da =
      (catalysis_rate / (h + seashell.inhibitor_constant)) *
        (saturation_factor + seashell.initial_catalysis) +
      -seashell.activator_decay * a +
      seashell.activator_diffusion * laplacian_a;

    // change in inhibitor dh/dt
    const dh =
      seashell.inhibitor_production +
      catalysis_rate * saturation_factor +
      (-seashell.inhibitor_decay / c) * h +
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
    (seashell.hormone_production * activator_sum) / W +
    -seashell.hormone_decay * c;
  hormone[WRITE] = c + dc * seashell.delta_time;
}

function ping_pong(state) {
  const { activator, inhibitor, hormone } = state;
  [activator[READ], activator[WRITE]] = [activator[WRITE], activator[READ]];
  [inhibitor[READ], inhibitor[WRITE]] = [inhibitor[WRITE], inhibitor[READ]];
  [hormone[READ], hormone[WRITE]] = [hormone[WRITE], hormone[READ]];
}

export const sketch = (p) => {
  const state = {
    seashell: SeashellParameters.OLIVIA_PORPHYRIA,
    conversion_rate: new Array(W),
    fluctuation_scale: 0.1,

    // Ping pong buffers, indexed with READ / WRITE enum
    activator: [new Array(W + 2).fill(0), new Array(W + 2).fill(0)],
    inhibitor: [new Array(W + 2).fill(0.1), new Array(W + 2).fill(0.1)],

    // The hormone is constant across the ridge
    // but again, let's ping-pong
    hormone: [0.5, 0.5],
  };

  p.setup = () => {
    p.createCanvas(W, H);

    initial_conditions(state);
    p.background(0);
  };

  p.draw = () => {
    const row = p.frameCount - 1;
    if (row >= H) {
      return;
    }

    const { seashell, activator } = state;

    p.stroke(...seashell.substrate_color);
    p.strokeWeight(2);
    p.line(0, row, p.width, row);

    p.stroke(...seashell.pigment_color);
    for (let i = 0; i < W; i++) {
      const a = activator[READ][i + 1];
      if (a > 0.5) {
        p.point(i, row);
      }
    }

    for (let i = 0; i < seashell.iters_per_update; i++) {
      update(state);
      ping_pong(state);
    }
  };
};
