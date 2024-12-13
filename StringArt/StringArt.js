import { Polar } from "../sketchlib/Polar.js";
import { ModPolynomial } from "./ModPolynomial.js";

const MODULUS = 60;
const WIDTH = 500;
const HEIGHT = 700;
const DIAMETER = 0.9 * WIDTH;
const RADIUS = DIAMETER / 2;

export const sketch = (p) => {
  const coefficients = [0, 0, 16, 3];
  let poly = new ModPolynomial(...coefficients, MODULUS);
  const polynomial_div = document.getElementById("polynomial");

  const points = new Array(MODULUS);

  let animate = false;

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

  function configure_animate_checkbox() {
    const checkbox = document.getElementById("animate");

    checkbox.checked = false;

    checkbox.addEventListener("change", (e) => {
      animate = e.target.checked;
    });
  }

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);

    // Configure the UI elements in the HTML page
    polynomial_div.innerText = poly.to_string();
    configure_slider("coeff-a", 0);
    configure_slider("coeff-b", 1);
    configure_slider("coeff-c", 2);
    configure_slider("coeff-d", 3);

    configure_animate_checkbox();

    for (let i = 0; i < MODULUS; i++) {
      points[i] = new Polar(RADIUS, (i * 2.0 * Math.PI) / MODULUS);
    }
  };

  p.draw = () => {
    p.background(0);

    const cx = p.width / 2;
    const cy = p.height / 2;

    p.push();
    p.translate(cx, cy);

    // Draw the unit circle
    // Colors from https://coolors.co/palette/540d6e-ee4266-ffd23f-3bceac-0ead69
    p.stroke("#540D6E");
    p.strokeWeight(5);
    p.noFill();
    p.circle(0, 0, DIAMETER);

    // Draw lines from x -> f(x)
    p.stroke("#FFD23F");
    p.noFill();
    p.strokeWeight(2);
    for (let i = 0; i < MODULUS; i++) {
      const start = i;
      const end = poly.compute(i);

      const start_polar = points[start];
      const end_polar = points[end];

      if (start == end) {
        p.circle(start_polar.x, start_polar.y, 0.05 * p.width);
      } else {
        p.line(start_polar.x, start_polar.y, end_polar.x, end_polar.y);
      }
    }

    // Animate transitions between points
    if (animate) {
      p.noStroke();
      p.fill("#3BCEAC");
      const ANIMATION_PERIOD = 300;
      const t = (p.frameCount % ANIMATION_PERIOD) / ANIMATION_PERIOD;
      for (let i = 0; i < MODULUS; i++) {
        const start = i;
        const end = poly.compute(i);

        if (start == end) {
          continue;
        }

        const start_polar = points[start];
        const end_polar = points[end];

        const x = p.lerp(start_polar.x, end_polar.x, t);
        const y = p.lerp(start_polar.y, end_polar.y, t);

        p.circle(x, y, 0.02 * p.width);
      }
    }

    // Draw dots at each point on the circle
    p.noStroke();
    p.fill("#EE4266");
    for (let i = 0; i < MODULUS; i++) {
      const point = points[i];

      p.circle(point.x, point.y, 0.02 * p.width);
    }

    p.pop();
  };
};
