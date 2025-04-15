import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { DoubleSpringSystem, Spring } from "./DoubleSpringSystem.js";

const SPRING_CONSTANT = 5.0;
const REST_LENGTH = 1.0;
const BOB_MASS = 0.5;
const BOB_WIDTH = 0.4;
// All springs will be the same, I'm only varying the initial positions
const SPRING = new Spring(SPRING_CONSTANT, REST_LENGTH, BOB_MASS, BOB_WIDTH);

/**
 * Make initial state with slight changes in position
 * @param {number} spring_index Which spring it is
 * @returns {number[]} initial state
 */
function vary_position(spring_index) {
  const delta_x = 0.1 * spring_index;
  return [-0.5 + delta_x, 0.5, 0.5, 0.5];
}

const N = 5;
const HISTORY_SIZE = 100;
const SPRING_SYSTEMS = new Array(N);
for (let i = 0; i < N; i++) {
  SPRING_SYSTEMS[i] = new DoubleSpringSystem(
    SPRING,
    SPRING,
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

    const animations = new GroupPrimitive(spring_animations);

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

    const scene = new GroupPrimitive([
      ...animations,
      phase_axes,
      ...phase_animations,
    ]);

    draw_primitive(p, scene);

    SPRING_SYSTEMS.forEach((x) => x.step(DELTA_TIME));
  };
};
