import { Polar } from "../sketchlib/Polar.js";

const MODULUS = 60;

/**
 * Polynomial ax^3 + bx^2 + cx + d where the coefficients
 * and values are evaluated mod n
 */
class Polynomial {
  constructor(a, b, c, d) {
    this.coefficients = [a, b, c, d];
  }

  compute(x) {
    const x2 = (x * x) % MODULUS;
    const x3 = (x2 * x) % MODULUS;
    const [a, b, c, d] = this.coefficients;

    return (a * x3 + b * x2 + c * x + d) % MODULUS;
  }

  to_string() {
    const [a, b, c, d] = this.coefficients;
    let terms = [];

    if (a != 0) {
      terms.push(`${a}x^3`);
    }

    if (b != 0) {
      terms.push(`${b}x^2`);
    }

    if (c != 0) {
      terms.push(`${c}x`);
    }

    if (d != 0) {
      terms.push(`${d}`);
    }

    if (terms.length == 0) {
      return `0 (mod ${MODULUS})`;
    }
    return `${terms.join(" + ")} (mod ${MODULUS})`;
  }
}

export const sketch = (p) => {
  const coefficients = [1, 2, 3, 4];
  let poly = new Polynomial(...coefficients);
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
    poly = new Polynomial(...coefficients);

    polynomial_div.innerText = poly.to_string();
    return false;
  };

  p.keyReleased = () => {
    display_sliders = !display_sliders;
  };
};
