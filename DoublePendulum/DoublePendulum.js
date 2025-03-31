import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";

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
