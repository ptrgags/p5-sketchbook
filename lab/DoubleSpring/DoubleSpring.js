import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { group } from "../../sketchlib/primitives/shorthand.js";
import { Oklch } from "../lablib/Oklch.js";
import { DoubleSpringSystem, Spring } from "./DoubleSpringSystem.js";

const N = 5;
const HISTORY_SIZE = 100;

const DARK_ORANGE = new Oklch(0.54, 0.1246, 43.41);
const LIGHT_YELLOW = new Oklch(0.82, 0.1246, 93.18);
const DARK_PURPLE = new Oklch(0.5, 0.1246, 285.88);
const LIGHT_BLUE = new Oklch(0.76, 0.1246, 209.65);

const PALETTE_A = Oklch.gradient(DARK_ORANGE, LIGHT_YELLOW, N);
const PALETTE_B = Oklch.gradient(DARK_PURPLE, LIGHT_BLUE, N);

const SPRING_CONSTANT = 5.0;
const REST_LENGTH = 1.0;
const BOB_MASS = 0.5;
const BOB_WIDTH = 0.4;

/**
 * Build a spring
 * @param {"left" | "right"} selected_spring Which of the two springs to color
 * @param {number} index The index of the spring in [0, N)
 */
function make_spring(selected_spring, index) {
  const palette = selected_spring === "left" ? PALETTE_A : PALETTE_B;
  const color = palette[index];
  return new Spring(SPRING_CONSTANT, REST_LENGTH, BOB_MASS, BOB_WIDTH, color);
}

/**
 * Make initial state with slight changes in position
 * @param {number} spring_index Which spring it is
 * @returns {number[]} initial state
 */
function vary_position(spring_index) {
  const delta_x = 0.1 * spring_index;
  return [-0.5 + delta_x, 0.5, 0.5, 0.5];
}

const SPRING_SYSTEMS = new Array(N);
for (let i = 0; i < N; i++) {
  SPRING_SYSTEMS[i] = new DoubleSpringSystem(
    make_spring("left", i),
    make_spring("right", i),
    vary_position(i),
    HISTORY_SIZE
  );
}

const DELTA_TIME = 0.01;

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
  };

  p.draw = () => {
    p.background(0);

    const spring_animations = SPRING_SYSTEMS.map((system, i) => {
      const origin = Point.point(10, 100 * i + 100);
      return system.render(origin);
    });

    const animations = group(...spring_animations);

    const X_SCALE = 300;
    const V_SCALE = 30;
    const phase_origin = Point.point(WIDTH / 2, (7 * HEIGHT) / 8);
    const phase_axes = SPRING_SYSTEMS[0].render_phase_axes(
      phase_origin,
      X_SCALE,
      V_SCALE
    );

    const phase_animations = SPRING_SYSTEMS.flatMap((system) => {
      return system.render_phase(phase_origin, X_SCALE, V_SCALE);
    });

    const scene = group(...animations, phase_axes, ...phase_animations);

    scene.draw(p);

    SPRING_SYSTEMS.forEach((x) => x.step(DELTA_TIME));
  };
};
