import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { DoubleSpringSystem, Spring } from "./DoubleSpringSystem.js";

const SPRING_CONSTANT = 5.0;
const REST_LENGTH = 1.0;
const BOB_MASS = 0.5;
const BOB_WIDTH = 0.4;

const X_SCALE = 100;
const V_SCALE = 30;

// Both springs will be identical in size
const SPRING = new Spring(SPRING_CONSTANT, REST_LENGTH, BOB_MASS, BOB_WIDTH);
// start with the springs slightly compressed
const INITIAL_STATE = [-0.5, 0.0, -1, 0.0];
const HISTORY_SIZE = 10000;

const SYSTEM = new DoubleSpringSystem(
  // The two springs are identical for this sketch
  SPRING,
  SPRING,
  INITIAL_STATE,
  HISTORY_SIZE
);

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

    const origin = Point.point(10, (3 * HEIGHT) / 4);
    const spring_animation = SYSTEM.render(origin);

    const phase_origin = Point.point(WIDTH / 2, HEIGHT / 4);
    const phase_axes = SYSTEM.render_phase_axes(phase_origin, X_SCALE, V_SCALE);
    const [phase1, phase2] = SYSTEM.render_phase(
      phase_origin,
      X_SCALE,
      V_SCALE
    );

    const scene = new GroupPrimitive([
      spring_animation,
      phase_axes,
      phase1,
      phase2,
    ]);

    draw_primitive(p, scene);

    SYSTEM.step(DELTA_TIME);
  };
};
