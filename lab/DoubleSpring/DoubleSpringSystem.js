import { Point } from "../../pga2d/objects.js";
import {
  GroupPrimitive,
  LinePrimitive,
  RectPrimitive,
} from "../../sketchlib/primitives.js";
import { RungeKuttaIntegrator } from "../../sketchlib/RungeKuttaIntegrator.js";
import { Color, Style } from "../../sketchlib/Style.js";
import { ValueHistory } from "../../sketchlib/ValueHistory.js";
import {
  GeneralizedCoordinates,
  PhasePoint,
} from "../../sketchlib/VectorSpace.js";

export class Spring {
  /**
   * Constructor
   * @param {number} spring_constant The spring constant k
   * @param {number} mass The mass of the bob connected to the spring m
   * @param {number} rest_length The rest length of the spring in meters
   */
  constructor(spring_constant, mass, rest_length) {
    this.spring_constant = spring_constant;
    this.mass = mass;
    this.rest_length = rest_length;
  }
}

function render_horizontal_spring(position, dimensions, num_coils) {
  const { x: w, y: h } = dimensions;

  const delta_x = Point.direction(w / num_coils, 0);
  const delta_y = Point.DIR_Y.scale(h);
  const wires = [];

  for (let i = 0; i < num_coils; i++) {
    const a = position.add(delta_x.scale(i));
    const b = position.add(delta_x.scale(i + 0.5)).add(delta_y);
    const c = position.add(delta_x.scale(i + 1));

    const diag_down = new LinePrimitive(a, b);
    const diag_up = new LinePrimitive(b, c);
    wires.push(diag_down, diag_up);
  }
  return new GroupPrimitive(
    wires,
    new Style().with_stroke(new Color(255, 255, 0)).with_width(2)
  );
}

export class DoubleSpringSystem {
  /**
   * Constructor
   * @param {Spring} spring1 The left spring, attached to the wall
   * @param {Spring} spring2 The right spring, attached to the first spring
   * @param {number[]} initial_state The initial state of the system, [x1, v1, x2, v2]
   * @param {number} history_size The number of points of history to keep
   */
  constructor(spring1, spring2, initial_state, history_size) {
    this.spring1 = spring1;
    this.spring2 = spring2;

    this.simulation = new RungeKuttaIntegrator(
      GeneralizedCoordinates,
      (t, state) => this.motion(state),
      initial_state
    );
    this.history = new ValueHistory(this.history);
    this.history.push(initial_state);
  }

  /**
   * Equation of motion for the two spring system.
   * @param {number[]} state the state variables [x1, v1, x2, v2]
   * @returns {number[]} The next state
   */
  motion(state) {
    const [x1, v1, x2, v2] = state;
    const a1 =
      (this.spring2.spring_constant * (x2 - x1) -
        this.spring1.spring_constant * x1) /
      this.spring1.mass;
    const a2 =
      (this.spring2.spring_constant * x1 - this.spring2.spring_constant * x2) /
      this.spring2.mass;

    return [v1, a1, v2, a2];
  }

  /**
   * Perform one simulation step
   * @param {number} dt The time step
   */
  step(dt) {
    this.simulation.update(dt);
    this.history.push(this.simulation.state);
  }

  /**
   * Render the spring system
   * @param {Point} origin The origin
   * @returns {GroupPrimitive} The primtitive to render
   */
  render(origin) {
    const [x1, , x2] = this.simulation.state;

    const PIXEL_SCALE = 100;

    const wall = new LinePrimitive(
      origin,
      origin.add(Point.DIR_Y.scale(-PIXEL_SCALE))
    );
    const floor = new LinePrimitive(
      origin,
      origin.add(Point.DIR_X.scale(4 * PIXEL_SCALE))
    );

    const BOB_WIDTH = 0.5;
    const bob_height = origin.add(Point.DIR_Y.scale(-PIXEL_SCALE * BOB_WIDTH));

    const bob1_position = bob_height.add(
      Point.DIR_X.scale(PIXEL_SCALE * (this.spring1.rest_length + x1))
    );
    const bob1 = new RectPrimitive(
      bob1_position,
      Point.direction(BOB_WIDTH, BOB_WIDTH).scale(PIXEL_SCALE)
    );

    const NUM_COILS = 10;
    const spring1 = render_horizontal_spring(
      bob_height,
      Point.direction(
        PIXEL_SCALE * (this.spring1.rest_length + x1),
        BOB_WIDTH * PIXEL_SCALE
      ),
      NUM_COILS
    );

    const rest_length =
      this.spring1.rest_length + BOB_WIDTH + this.spring2.rest_length;
    const bob2_position = bob_height.add(
      Point.DIR_X.scale(PIXEL_SCALE * (rest_length + x2))
    );
    const bob2 = new RectPrimitive(
      bob2_position,
      Point.direction(BOB_WIDTH, BOB_WIDTH).scale(PIXEL_SCALE)
    );

    const spring2 = render_horizontal_spring(
      bob1_position.add(Point.DIR_X.scale(PIXEL_SCALE * BOB_WIDTH)),
      Point.direction(
        PIXEL_SCALE * (this.spring2.rest_length + (x2 - x1)),
        BOB_WIDTH * PIXEL_SCALE
      ),
      NUM_COILS
    );

    return new GroupPrimitive(
      [wall, floor, bob1, bob2, spring1, spring2],
      new Style().with_stroke(new Color(255, 0, 0))
    );
  }
}

/**
 * from physics.graphics import horizontal_spring, vertical_wall, horizontal_wall
from physics.rungekutta import RungeKuttaSimulation
from physics.vectors import Vector

class TwoSpringSystem(object):
    def __init__(self, k1, k2, m1, m2, l1, l2, w1, w2, initial_state, history_size = 100):
        self.k1 = k1
        self.k2 = k2
        self.m1 = m1
        self.m2 = m2
        self.simulation = RungeKuttaSimulation(self.motion, initial_state, history_size = history_size)
        self.state = initial_state
        
        w = max(w1, w2)
        l = l1 + l2
        
        self.wall_pos= Vector(-w / 4.0, -w * 3.0 / 2.0)
        self.wall_dims = Vector(w / 4.0, w * 2.0)
        self.floor_pos = Vector(0, w / 2.0)
        self.floor_dims = Vector(l * 2.0, w / 4.0)
        
        self.spring1_pos = Vector(0, -w1 / 2.0)
        self.spring1_dims_rest = Vector(l1, w1)
        self.spring2_pos_rest = Vector(l1 + w1, -w2 / 2.0)
        self.spring2_dims_rest = Vector(l2, w2) 
        
        self.bob1_pos_rest = Vector(l1, -w1 / 2.0)
        self.bob1_dims = Vector(w1, w1)
        self.bob2_pos_rest = Vector(l1 + w1 + l2, -w2 / 2.0)
        self.bob2_dims = Vector(w2, w2)
        
        self.history_origin1 = Vector(l1 + w / 2.0, 0)
        self.history_origin2 = Vector(l1 + w1 + l2 + w2 / 2.0, 0)
                               
    def step(self):
        self.state = next(self.simulation)
    
    def motion(self, state):
        x1, v1, x2, v2 = state
        a1 = (self.k2 * x2 - self.k1 * x1 - self.k2 * x1) / self.m1
        a2 = (self.k2 * x1 - self.k2 * x2) / self.m2
        return Vector(v1, a1, v2, a2)
    
    def draw_history(self, origin, scale, c=color(255, 0, 0)):
        pushMatrix()
        translate(*origin)
        stroke(c)
        for past_x1, _, past_x2, _ in self.simulation.history:
            point(*(scale * (self.history_origin1 + [past_x1, 0])))
            point(*(scale * (self.history_origin2 + [past_x1 + past_x2, 0])))
        popMatrix()
    
    def draw_phase(self, origin, x_scale, v_scale, c, component = 0):
        pushMatrix()
        translate(*origin)
        stroke(c)
        index = component * 2
        past = [state[index:index + 2] for state in self.simulation.history]
        for x, v in past:
            point(x_scale * x, v_scale * v)
        popMatrix()
    
    def draw_phase_axes(self, origin, x_scale, v_scale, x_limits, v_limits, c=color(255, 255, 255)):
        pushMatrix()
        translate(*origin)
        stroke(c)
        x_min, x_max = x_limits * x_scale
        line(x_min, 0, x_max, 0)
        text("x", x_max, 10)
        v_min, v_max = v_limits * v_scale
        line(0, v_min, 0, v_max)
        text("v", 10, -v_max)
        popMatrix()

    def draw(self, origin, scale, colors):
        spring_x1, _, spring_x2, _ = self.state
        
        pushMatrix()
        translate(*origin)
        stroke(255)
        #Wall
        x, y = self.wall_pos * scale
        w, h = self.wall_dims * scale
        vertical_wall(x, y, w, h, 10, right=True)
        
        #Floor
        x, y = self.floor_pos * scale
        w, h = self.floor_dims * scale
        horizontal_wall(x, y, w, h, 20, top=True)
        
        stroke(colors[0])
        #Spring1
        x, y = self.spring1_pos * scale
        w, h = (self.spring1_dims_rest + [spring_x1, 0]) * scale
        horizontal_spring(x, y, w, h, 10)
    
        #Bob1
        x, y = (self.bob1_pos_rest + [spring_x1, 0]) * scale
        w, h = self.bob1_dims * scale
        rect(x, y, w, h)        
        
        stroke(colors[1])
        #Spring2
        x, y = (self.spring2_pos_rest + [spring_x1, 0]) * scale
        w, h = (self.spring2_dims_rest + [spring_x2, 0]) * scale
        horizontal_spring(x, y, w, h, 10)
    
        #Bob2
        x, y = (self.bob2_pos_rest + [spring_x1 + spring_x2, 0]) * scale
        w, h = self.bob2_dims * scale
        rect(x, y, w, h)       
        popMatrix()
 */

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
