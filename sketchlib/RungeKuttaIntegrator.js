import "./VectorSpace.js";

/**
 * A 4th order Runge-Kutta integrator. This offers greater precision than
 * forward Euler integration
 * @template V the vector type that we're integrating
 */
export class RungeKuttaIntegrator {
  /**
   * @param {import("./VectorSpace.js").VectorSpace<V>} vector_space The underlying vector space over V
   * @param {function(number, V): V} motion_equation The equation of motion that takes
   * a state vector and current time and returns the instananeous time derivative of each variable
   * @param {V} initial_state The initial state at time 0
   */
  constructor(vector_space, motion_equation, initial_state) {
    this.vector_space = vector_space;
    this.motion_equation = motion_equation;
    this.state = initial_state;
    this.time = 0;
  }

  /**
   * Update the state for the next integration step.
   * @param {number} dt Time delta for the next simulation step
   */
  update(dt) {
    const tangent1 = this.motion_equation(this.time, this.state);

    const { add: add, scale: scale } = this.vector_space;

    const half_dt = 0.5 * dt;
    const projected_state1 = add(this.state, scale(half_dt, tangent1));
    const tangent2 = this.motion_equation(
      this.time + 0.5 * dt,
      projected_state1
    );

    const projected_state2 = add(this.state, scale(half_dt, tangent2));
    const tangent3 = this.motion_equation(
      this.time + 0.5 * dt,
      projected_state2
    );

    const projected_state3 = add(this.state, scale(dt, tangent3));
    const tangent4 = this.motion_equation(this.time + dt, projected_state3);

    // dt/6 * (t1 + 2 t2 + 2 t3 + t4)
    const doubled_terms = scale(2, add(tangent2, tangent3));
    const other_terms = add(tangent1, tangent4);
    const in_parentheses = add(doubled_terms, other_terms);
    const weighted_tangent = scale(dt / 6, in_parentheses);

    this.state = add(this.state, weighted_tangent);
    this.time += dt;
  }
}
