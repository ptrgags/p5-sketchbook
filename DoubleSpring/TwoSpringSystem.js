import { PhasePoint } from "../sketchlib/VectorSpace";

class HorizontalSpring {
  /**
   *
   * @param {number} spring_constant The spring's stiffness, k
   * @param {number} rest_length The rest length
   * @param {number} width The width of the spring for drawing
   * @param {PhasePoint<number>} initial_phase The starting position of the system.
   */
  constructor(spring_constant, rest_length, width, initial_phase) {
    (this.spring_constant = spring_constant), (this.rest_length = rest_length);
    this.width = width;
    this.initial_phase = initial_phase;
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
