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
const V_SCALE = 100;

// Both springs will be identical in size
const SPRING = new Spring(SPRING_CONSTANT, REST_LENGTH, BOB_MASS, BOB_WIDTH);
// start with the springs slightly compressed
const INITIAL_STATE = [-0.5, 0.0, -0.5, 0.0];
const HISTORY_SIZE = 1000;

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
    const phase_axes = SYSTEM.render_phase_axes(phase_origin, 100, 100);

    const scene = new GroupPrimitive([spring_animation, phase_axes]);

    draw_primitive(p, scene);

    SYSTEM.step(DELTA_TIME);
  };
};

/**

def draw():
    system.step()
    
    center = Vector(width / 2.0, height / 2.0)
    origin = center + SCALE * Vector(-2.5, 0)
    phase_origin = center + Vector(0, -150)
    
    background(0)
    noFill()
    
    colors = [color(0, 255, 0), color(255, 255, 00)]
    
    system.draw_history(origin, SCALE)
    system.draw(origin, SCALE, colors)
    
    for i, c in enumerate(colors):
        system.draw_phase(phase_origin, 100, 20, c, i)
    system.draw_phase_axes(phase_origin, 100, 20, Vector(-0.6, 0.6), Vector(-3, 3))
 */
