import { PhyllotaxisPalette } from "../sketchlib/PhyllotaxisPalette.js";

const PRIMORDIUM_CREATION_PERIOD = 50;
const RECT_SIZE = 8;

export const sketch = (p) => {
  let primordia_count = 2;
  let palette = new PhyllotaxisPalette(primordia_count);
  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    p.push();
    p.colorMode(p.HSB, 1.0);

    const max_radius = p.width / 2;
    for (let i = 0; i < primordia_count; i++) {
      const { hue, saturation, value } = palette.get_color(i);
      p.fill(hue, saturation, value);

      p.push();
      p.translate(p.width / 2, p.height / 2);
      const { r, theta } = palette.get_point(i);
      p.circle(
        max_radius * r * p.cos(theta),
        -max_radius * r * p.sin(theta),
        20
      );
      p.pop();

      p.rect(0, i * RECT_SIZE, RECT_SIZE, RECT_SIZE);
    }

    p.pop();

    // Add another point to the palette over time.
    if (p.frameCount % PRIMORDIUM_CREATION_PERIOD == 0) {
      const prev_count = primordia_count;
      primordia_count++;
      primordia_count = p.min(primordia_count, p.height / RECT_SIZE);
      if (primordia_count != prev_count) {
        palette = new PhyllotaxisPalette(primordia_count);
      }
    }
  };
};
