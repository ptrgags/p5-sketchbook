import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";

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
 * import fix_path
from TwoSpringSystem import TwoSpringSystem
from physics.vectors import Vector

k1 = 5.0
m1 = 0.5
k2 = 5.0
m2 = 0.5
l1 = 1.0
l2 = 1.0
w1 = 0.4
w2 = 0.4

SCALE=100
INITIAL_STATE = [-0.5, 0.0, -0.5, 0.0]

def setup():
    global system
    size(640, 480)
    system = TwoSpringSystem(k1, k2, m1, m2, l1, l2, w1, w2, INITIAL_STATE, 200)

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

// also I'll need this:

/*
def horizontal_spring(x, y, w, h, coils):
    '''
    Draw a spring on the screen horizontally
    x -- the x coordinate of the top left corner
    y -- the y component of the top left corner
    w -- width of the spring
    h -- height of the spring
    coils -- the number of coils to draw for this spring
    '''
    dx = float(w) / coils
    pushMatrix()
    translate(x, y)
    for i in xrange(coils):
        line(i * dx, 0, (i + 0.5) * dx, h)
        line((i + 0.5) * dx, h, (i + 1) * dx, 0)
    popMatrix()
*/
