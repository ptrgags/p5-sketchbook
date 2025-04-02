import { Point } from "../pga2d/objects.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { DoublePendulumSystem, Pendulum } from "./DoublePendulumSystem.js";

const PENDULUM1 = new Pendulum(1.0, 1.0);
const PENDULUM2 = new Pendulum(1.0, 1.0);
const INITIAL_STATE = [0.9 * Math.PI, 0.0, Math.PI / 2, 0.0];
const SYSTEM = new DoublePendulumSystem(PENDULUM1, PENDULUM2, INITIAL_STATE);
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

    const center_offset = Point.point(p.width / 2, p.height / 2);
    draw_primitive(p, SYSTEM.render(center_offset));

    SYSTEM.step(DELTA_TIME);
  };
};

/**
 * from DoublePendulumSystem import DoublePendulumSystem
from physics.vectors import Vector

#constant scalars
l1 = 1.0
m1 = 1.0
l2 = 1.0
m2 = 1.0

SCALE = 100
INITIAL_STATE = [0.9 * PI, 0.0, 0.0 * PI, 0.0]

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
