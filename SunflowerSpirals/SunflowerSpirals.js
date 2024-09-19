const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = (2 * Math.PI) / GOLDEN_RATIO / GOLDEN_RATIO;

// How many frames before the next primordium is created
const PRIMORDIUM_CREATION_PERIOD = 10;

// How fast the primordia spread out
const PRIMORDIUM_SPEED = 3 / 16;
const PRIMORDIUM_MIN_SIZE = 4;
const PRIMORDIUM_GROWTH_RATE = 1 / 32;

const MAX_PRIMORDIA = 250;

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

export const sketch = (p) => {
  const primordia = [];
  let primordia_count = 0;

  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    for (const primordium of primordia) {
      const yellowness = p.max(primordium.distance / (0.4 * p.width), 0.25);

      p.fill(255 * yellowness, 255 * yellowness, 0);
      p.push();
      p.translate(p.width / 2, p.height / 2);
      p.circle(
        primordium.distance * p.cos(primordium.angle),
        -primordium.distance * p.sin(primordium.angle),
        primordium.size
      );
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
