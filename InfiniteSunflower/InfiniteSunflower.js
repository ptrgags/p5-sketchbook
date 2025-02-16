import { Primordium } from "./Primordium.js";
import { Petal } from "./Petal.js";

// How many frames before the next primordium is created
const PRIMORDIUM_CREATION_PERIOD = 10;

// How fast the primordia spread out
const PRIMORDIUM_SPEED = 3 / 16;
const PRIMORDIUM_MIN_SIZE = 4;
const PRIMORDIUM_GROWTH_RATE = 1 / 32;

const MAX_PRIMORDIA = 150;

function draw_petal(p, petal) {
  // flip coordinates so y is up.
  p.push();
  p.scale(1, -1);

  p.beginShape();
  p.vertex(petal.start.x, petal.start.y);
  p.vertex(petal.side_cw.x, petal.side_cw.y);
  p.bezierVertex(
    petal.control_cw.x,
    petal.control_cw.y,
    petal.control_tip.x,
    petal.control_tip.y,
    petal.tip.x,
    petal.tip.y
  );
  p.bezierVertex(
    petal.control_tip.x,
    petal.control_tip.y,
    petal.control_ccw.x,
    petal.control_ccw.y,
    petal.side_ccw.x,
    petal.side_ccw.y
  );
  p.endShape(p.CLOSE);
  p.pop();
}

function sunflower_palette(p, t) {
  const BROWN = p.color(63, 31, 0);
  const ORANGE = p.color(255, 127, 0);
  const YELLOW = p.color(255, 255, 0);

  const BROWN_POINT = 0.5;
  const ORANGE_POINT = 0.7;
  const YELLOW_POINT = 0.8;

  if (t < BROWN_POINT) {
    return BROWN;
  } else if (t < ORANGE_POINT) {
    const t_adjusted = p.map(t, BROWN_POINT, ORANGE_POINT, 0, 1);
    return p.lerpColor(BROWN, ORANGE, t_adjusted);
  } else if (t < YELLOW_POINT) {
    const t_adjusted = p.map(t, ORANGE_POINT, YELLOW_POINT, 0, 1);
    return p.lerpColor(ORANGE, YELLOW, t_adjusted);
  } else {
    return YELLOW;
  }
}

export const sketch = (p) => {
  const primordia = [];
  let primordia_count = 0;

  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    for (const primordium of primordia) {
      const position = primordium.get_position(p.frameCount);
      const size = primordium.get_size(p.frameCount);

      const dist = Math.min(position.r / (0.5 * p.width));
      const petal_color = sunflower_palette(p, dist);

      p.fill(petal_color);
      p.push();
      p.translate(p.width / 2, p.height / 2);

      const petal = new Petal(position, size);
      draw_petal(p, petal);

      p.pop();
    }

    if (p.frameCount % PRIMORDIUM_CREATION_PERIOD == 0) {
      const primordium = new Primordium(
        primordia_count,
        p.frameCount,
        PRIMORDIUM_MIN_SIZE,
        PRIMORDIUM_SPEED,
        PRIMORDIUM_GROWTH_RATE
      );
      primordia.push(primordium);
      primordia_count++;

      if (primordia.length >= MAX_PRIMORDIA) {
        primordia.shift();
      }
    }
  };
};
