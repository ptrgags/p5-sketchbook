import { Polar } from "../sketchlib/Polar.js";
import { ModPolynomial } from "./ModPolynomial.js";

const MODULUS = 60;

export const sketch = (p) => {
  const coefficients = [1, 2, 3, 4];
  let poly = new ModPolynomial(...coefficients, MODULUS);
  let display_sliders = true;

  let polynomial_div = document.getElementById("polynomial");

  p.setup = () => {
    p.createCanvas(500, 700);
    polynomial_div.innerText = poly.to_string();
  };

  p.draw = () => {
    p.background(0);

    if (display_sliders) {
      p.fill(255);
      p.noStroke();
      const n = coefficients.length;
      const height = p.height / 4;
      for (let i = 0; i < n; i++) {
        p.rect(
          0,
          i * height,
          (p.width * coefficients[i]) / (MODULUS - 1),
          height
        );
      }
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
    for (let i = 0; i < MODULUS; i++) {
      const start = i;
      const end = poly.compute(i);

      const start_polar = new Polar(radius, (start * 2.0 * Math.PI) / MODULUS);
      const end_polar = new Polar(radius, (end * 2.0 * Math.PI) / MODULUS);

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
    const bin_size = p.width / MODULUS;
    const value = Math.round(p.mouseX / bin_size);
    coefficients[index] = Math.max(Math.min(value, MODULUS - 1), 0);
  };

  p.mouseReleased = () => {
    poly = new ModPolynomial(...coefficients, MODULUS);

    polynomial_div.innerText = poly.to_string();
    return false;
  };

  p.keyReleased = () => {
    display_sliders = !display_sliders;
  };
};
