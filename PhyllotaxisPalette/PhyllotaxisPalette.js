const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = (2 * Math.PI) / GOLDEN_RATIO / GOLDEN_RATIO;

const PRIMORDIUM_CREATION_PERIOD = 50;
const RECT_SIZE = 8;

export const sketch = (p) => {
  let primordia_count = 0;
  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    p.push();
    p.colorMode(p.HSB, 1.0);
    p.translate(p.width / 2, p.height / 2);
    const max_radius = p.width / 2;
    for (let i = 0; i <= primordia_count; i++) {
      const radius = 1.0 - i / primordia_count;
      const angle = i * GOLDEN_ANGLE;

      p.fill((angle % p.TWO_PI) / p.TWO_PI, radius, 1.0);
      p.circle(
        max_radius * radius * p.cos(angle),
        -max_radius * radius * p.sin(angle),
        20
      );

      p.rect(
        -p.width / 2.0,
        -p.height / 2 + i * RECT_SIZE,
        RECT_SIZE,
        RECT_SIZE
      );
    }

    p.pop();

    if (p.frameCount % PRIMORDIUM_CREATION_PERIOD == 0) {
      primordia_count++;
      primordia_count = p.min(primordia_count, p.height / RECT_SIZE);
    }
  };
};
