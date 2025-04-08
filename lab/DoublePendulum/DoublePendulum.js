import { Point } from "../../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { draw_primitive } from "../../sketchlib/draw_primitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives.js";
import { DoublePendulumSystem, Pendulum } from "./DoublePendulumSystem.js";

const BOB_MASS = 1.0;
const BOB_LENGTH = 0.9;
const BOB_RADIUS = 0.1;

const PENDULUM = new Pendulum(BOB_MASS, BOB_LENGTH, BOB_RADIUS);
const INITIAL_STATE = [0.9 * Math.PI, 0.0, Math.PI / 2, 0.0];
const HISTORY_SIZE = 1000;

const SYSTEM = new DoublePendulumSystem(
  PENDULUM,
  PENDULUM,
  INITIAL_STATE,
  HISTORY_SIZE
);
const DELTA_TIME = 0.01;

const THETA_SCALE = 20;
const THETA_DOT_SCALE = 6;

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

    const center_offset = Point.point(WIDTH / 2, (3 * HEIGHT) / 4);
    const pendulum_animation = SYSTEM.render(center_offset);

    const phase_origin = Point.point(WIDTH / 2, HEIGHT / 4);
    const phase_axes = SYSTEM.render_phase_axes(
      phase_origin,
      THETA_SCALE,
      THETA_DOT_SCALE
    );
    const [phase1, phase2] = SYSTEM.render_phase(
      phase_origin,
      THETA_SCALE,
      THETA_DOT_SCALE
    );

    const scene = new GroupPrimitive([
      pendulum_animation,
      phase_axes,
      phase1,
      phase2,
    ]);

    draw_primitive(p, scene);

    SYSTEM.step(DELTA_TIME);
  };
};

/**

def setup():
    global system
    size(640, 480)
    system = DoublePendulumSystem(l1, l2, m1, m2, 20, 20, INITIAL_STATE)

def draw():
    system.step()
    
    center = Vector(width/2.0, height / 2.0)
    phase_origin = center + Vector(0, -150)
    
    background(0)
    noFill()
    
    colors = [color(0, 255, 0), color(255, 255, 0)]
    
    system.draw_history(center, SCALE)
    system.draw(center, SCALE, colors)
    
    system.draw_phase(phase_origin, 10, 3, colors[0])
    system.draw_phase(phase_origin, 10, 3, colors[1], 1)
    system.draw_phase_axes(phase_origin, 10, 3, Vector(0, TAU), Vector(-10, 10))
 */
