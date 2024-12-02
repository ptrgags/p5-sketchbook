import { Polar } from "../sketchlib/Polar.js";

/**
 * Polynomial ax^3 + bx^2 + cx + d where the coefficients
 * and values are evaluated mod 12
 */
class PolynomialMod12 {
  constructor(a, b, c, d) {
    this.coefficients = [a, b, c, d];
  }

  compute(x) {
    const x2 = (x * x) % 12;
    const x3 = (x2 * x) % 12;
    const [a, b, c, d] = this.coefficients;

    return (a * x3 + b * x2 + c * x + d) % 12;
  }
}

export const sketch = (p) => {
  const coefficients = [1, 2, 3, 4];
  let poly = new PolynomialMod12(...coefficients);

  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    p.fill(255);
    p.noStroke();
    const n = coefficients.length;
    const height = p.height / 4;
    for (let i = 0; i < n; i++) {
      p.rect(0, i * height, (p.width * coefficients[i]) / 11, height);
    }

    const diameter = 0.9 * p.width;
    const radius = diameter / 2;
    const cx = p.width / 2;
    const cy = p.height / 2;

    p.stroke(255, 0, 0);
    p.noFill();
    p.circle(cx, cy, diameter);

    p.stroke(255, 127, 0);
    p.noFill();
    for (let i = 0; i < 12; i++) {
      const start = i;
      const end = poly.compute(i);

      const start_polar = new Polar(radius, (start * Math.PI) / 6.0);
      const end_polar = new Polar(radius, (end * Math.PI) / 6.0);

      if (start == end) {
        p.circle(cx + start_polar.x, cy + start_polar.y, 0.05 * p.width);
      } else {
        p.line(
          cx + start_polar.x,
          cy + start_polar.y,
          cx + end_polar.x,
          cy + end_polar.y
        );
      }
    }
  };

  p.mouseDragged = () => {
    const row_height = p.height / 4;
    const index = Math.floor(p.mouseY / row_height);
    const bin_size = p.width / 12;
    const value = Math.round(p.mouseX / bin_size);
    coefficients[index] = Math.max(Math.min(value, 11), 0);
  };

  p.mouseReleased = () => {
    poly = new PolynomialMod12(...coefficients);
  };
};
