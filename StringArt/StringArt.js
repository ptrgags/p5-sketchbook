import { Polar } from "../sketchlib/Polar.js";
import { ModPolynomial } from "./ModPolynomial.js";

const MODULUS = 60;

export const sketch = (p) => {
  const coefficients = [0, 0, 16, 3];
  let poly = new ModPolynomial(...coefficients, MODULUS);

  let polynomial_div = document.getElementById("polynomial");

  function update_coefficients() {
    poly = new ModPolynomial(...coefficients, MODULUS);

    polynomial_div.innerText = poly.to_string();
  }

  function configure_slider(id, index) {
    const slider = document.getElementById(id);

    slider.value = coefficients[index];

    slider.addEventListener("input", (e) => {
      coefficients[index] = parseInt(e.target.value);
    });
    slider.addEventListener("change", update_coefficients);
  }

  p.setup = () => {
    p.createCanvas(500, 700);
    polynomial_div.innerText = poly.to_string();
    configure_slider("coeff-a", 0);
    configure_slider("coeff-b", 1);
    configure_slider("coeff-c", 2);
    configure_slider("coeff-d", 3);
  };

  p.draw = () => {
    p.background(0);

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
};
