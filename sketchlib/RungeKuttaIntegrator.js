/**
 * A set of static functions that perform vector addition/scalar multiplication
 * for some arbitrary type.
 * @typedef {Object} VectorSpace
 * @template V The vector type
 * @property {function(V, V): V} add
 * @property {function(V, number): V} scale
 */

import { ValueHistory } from "./ValueHistory";

/**
 * A 4th order Runge-Kutta integrator. This offers greater precision than
 * forward Euler integration
 * @template V the vector type that we're integrating
 */
export class RungeKuttaIntegrator {
  /**
   * @param {VectorSpace} vector_space The underlying vector space over V
   * @param {function(V): V} motion_equation The equation of motion that takes
   * a state vector and returns the instananeous time derivative of each component
   * @param {V} initial_state The initial state at time 0
   * @param {number} dt The time delta
   */
  constructor(vector_space, motion_equation, initial_state, dt) {
    this.vector_space = vector_space;
    this.motion_equation = motion_equation;
    this.state = initial_state;
    this.dt = dt;
  }

  update(dt) {}
}

/*
from collections import deque
from vectors import vadd, vscale

def runge_kutta(f, state, dt = 0.01):
    '''
    Apply the Runge-Kutta approximation technique
    to a state vector for a single time step.

    f -- a function that takes a state vector
        and returns the instantaneous time derivative
        of each component
    state -- the existing state vector. Simply a list
        of floats with every variable needed in the system.
    dt -- the time delta

    returns the next state vector after
    one time step
    '''
    a = f(state)
    b = f(vadd(state, vscale(dt / 2.0, a)))
    c = f(vadd(state, vscale(dt / 2.0, b)))
    d = f(vadd(state, vscale(dt, b)))

    #Apply the weights dt/6 * (a + 2b + 2c + d)
    a = vscale(dt / 6.0, a)
    b = vscale(dt / 3.0, b)
    c = vscale(dt / 3.0, c)
    d = vscale(dt / 6.0, d)
    return vadd(state, a, b, c, d)

class RungeKuttaSimulation(object):
    '''
    RungeKutta simulation of equations of motion
    '''
    def __init__(self, motion_equation, initial_state, dt = 0.01, history_size = 1000):
        '''
        Intialize this RungeKutta object

        motion_equaton -- function Vector -> Vector that takes a vector of
            position/velocity coords and maps it onto the next velocity/accel
            coords.
        inital_state -- the starting state vector
        dt -- time delta for simulation.
        history_size -- history points to save.
        '''
        self.history_size = history_size
        self.history = deque()
        self.motion = motion_equation
        self.state = initial_state
        self.dt = dt

    def __iter__(self):
        return self

    def next(self):
        '''
        generate the next steps indefinitely
        save_history -- True if the history should be updated
        '''
        self.__update_history(self.state)
        self.state = self.__next_step()
        return self.state


    def __update_history(self, state):
        '''
        Add a state to the history.
        If the history grows too big, old points
        are popped from the left.

        state -- state Vector
        '''
        self.history.append(state)
        if len(self.history) > self.history_size:
            self.history.popleft()

    def __next_step(self):
        '''
        Go dt forward in time
        and update the current state
        and history
        '''
        #local aliases
        state = self.state
        f = self.motion
        dt = self.dt

        #Do the Runge-Kutta magic:
        a = f(state)
        b = f(state + dt / 2.0 * a)
        c = f(state + dt / 2.0 * b)
        d = f(state + dt * b)
        next_state = state + dt / 6.0 * (a + 2 * b + 2 * c + d)

        return next_state
*/
