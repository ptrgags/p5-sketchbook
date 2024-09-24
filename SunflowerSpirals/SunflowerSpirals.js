const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = (2 * Math.PI) / GOLDEN_RATIO / GOLDEN_RATIO;

// How many frames before the next primordium is created
const PRIMORDIUM_CREATION_PERIOD = 10;

// How fast the primordia spread out
const PRIMORDIUM_SPEED = 3 / 16;
const PRIMORDIUM_MIN_SIZE = 4;
const PRIMORDIUM_GROWTH_RATE = 1 / 32;

const MAX_PRIMORDIA = 150;

class Primordium {
  constructor(index) {
    this.index = index;
    this.size = PRIMORDIUM_MIN_SIZE;
    this.angle = index * GOLDEN_ANGLE;
    this.distance = 0;
  }

  update() {
    this.distance += PRIMORDIUM_SPEED;
    this.size += PRIMORDIUM_GROWTH_RATE;
  }
}

function to_rect(r, theta) {
  return {
    x: r * Math.cos(theta),
    y: r * -Math.sin(theta),
  };
}

export const sketch = (p) => {
  const primordia = [];
  let primordia_count = 0;

  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    const BROWN = p.color(63, 31, 0);
    const ORANGE = p.color(255, 127, 0);
    const YELLOW = p.color(255, 255, 0);

    const BROWN_POINT = 0.5;
    const ORANGE_POINT = 0.7;
    const YELLOW_POINT = 0.8;

    for (const primordium of primordia) {
      const dist = Math.min(primordium.distance / (0.5 * p.width));

      let petal_color;
      if (dist < BROWN_POINT) {
        petal_color = BROWN;
      } else if (dist < ORANGE_POINT) {
        petal_color = p.lerpColor(
          BROWN,
          ORANGE,
          p.map(dist, BROWN_POINT, ORANGE_POINT, 0, 1)
        );
      } else if (dist < YELLOW_POINT) {
        petal_color = p.lerpColor(
          ORANGE,
          YELLOW,
          p.map(dist, ORANGE_POINT, YELLOW_POINT, 0, 1)
        );
      } else {
        petal_color = YELLOW;
      }

      const yellowness = p.max(
        Math.pow(primordium.distance / (0.5 * p.width), 3.0),
        0.25
      );

      p.fill(petal_color);
      //p.fill(255 * yellowness, 255 * yellowness, 0);
      p.push();
      p.translate(p.width / 2, p.height / 2);

      const r = primordium.distance;
      const size = primordium.size;
      const theta = primordium.angle;

      const control_offset = 0.75;
      const r_start = r - 2 * size;
      const r_sides = r - size;
      const r_control_points = r_sides + control_offset * size;
      const r_tip = r + size;
      const r_tip_control_point = r_tip - control_offset * size;

      const HALF_ANGULAR_SIZE = 0.2;
      const theta1 = theta - HALF_ANGULAR_SIZE;
      const theta2 = theta + HALF_ANGULAR_SIZE;

      const start = to_rect(r_start, theta);
      const side1 = to_rect(r_sides, theta1);
      const side2 = to_rect(r_sides, theta2);
      const control1 = to_rect(r_control_points, theta1);
      const control2 = to_rect(r_control_points, theta2);
      const control_tip = to_rect(r_tip_control_point, theta);
      const tip = to_rect(r_tip, theta);

      p.beginShape();
      p.vertex(start.x, start.y);
      p.vertex(side1.x, side1.y);
      p.bezierVertex(
        control1.x,
        control1.y,
        control_tip.x,
        control_tip.y,
        tip.x,
        tip.y
      );
      p.bezierVertex(
        control_tip.x,
        control_tip.y,
        control2.x,
        control2.y,
        side2.x,
        side2.y
      );
      p.endShape(p.CLOSE);
      p.pop();
    }

    if (p.frameCount % PRIMORDIUM_CREATION_PERIOD == 0) {
      const primordium = new Primordium(primordia_count);
      primordia.push(primordium);
      primordia_count++;

      if (primordia.length >= MAX_PRIMORDIA) {
        primordia.shift();
      }
    }

    for (const primordium of primordia) {
      primordium.update();
    }
  };
};
