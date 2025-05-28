import { Point } from "../../pga2d/objects.js";
import {
  CirclePrimitive,
  LinePrimitive,
} from "../../sketchlib/rendering/primitives.js";
import { RungeKuttaIntegrator } from "../lablib/RungeKuttaIntegrator.js";
import { Style } from "../../sketchlib/Style.js";
import { RingBuffer } from "../lablib/RingBuffer.js";
import { GeneralizedCoordinates } from "../lablib/VectorSpace.js";
import { PI, TAU } from "../../sketchlib/math_consts.js";
import { mod } from "../../sketchlib/mod.js";
import { Color } from "../../sketchlib/Color.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";

const STYLE_AXIS = Style.DEFAULT_STROKE.with_width(2);
const ARM_STYLE = STYLE_AXIS;

const STYLE_PHASE1 = new Style({ stroke: Color.YELLOW });
const STYLE_PHASE2 = new Style({ stroke: Color.CYAN });

const PIXELS_PER_METER = 100;

export class Pendulum {
  /**
   * Constructor
   * @param {number} mass The mass of the pendulum's bob
   * @param {number} length The length of the pendulum arm
   * @param {number} bob_radius The radius of the pendulum's bob
   */
  constructor(mass, length, bob_radius) {
    this.mass = mass;
    this.bob_radius = bob_radius;
    this.length = length;
  }
}

export class DoublePendulumSystem {
  /**
   *
   * @param {Pendulum} pendulum1 The upper pendulum
   * @param {Pendulum} pendulum2 The lower pendulum
   * @param {number[]} initial_state The initial state: [theta1, theta_dot1, theta2, theta_dot2]
   * @param {number} history_size How many points of history to keep
   */
  constructor(pendulum1, pendulum2, initial_state, history_size) {
    this.pendulum1 = pendulum1;
    this.pendulum2 = pendulum2;

    this.simulation = new RungeKuttaIntegrator(
      GeneralizedCoordinates,
      (t, state) => this.motion(state),
      initial_state
    );
    this.history = new RingBuffer(history_size);
    this.history.push(initial_state);
  }

  /**
   *
   * @param {number} dt The dt value for this step
   */
  step(dt) {
    this.simulation.update(dt);
    this.history.push(this.simulation.state);
  }

  /**
   *
   * @param {number[]} state The generalized coordinates [theta1, theta_dot1, theta2, theta_dot2] for the given state
   * @returns {number[]} The instantaneous derivatives [theta_dot1, alpha1, theta_dot2, alpha2]
   */
  motion(state) {
    const [theta1, theta_dot1, theta2, theta_dot2] = state;

    const { mass: m1, length: l1 } = this.pendulum1;
    const { mass: m2, length: l2 } = this.pendulum2;

    const g = 9.81;

    // convenience substitutions
    const M = m1 + m2;
    const m2_half = m2 / 2.0;

    // Trig functions
    const a = theta1 - theta2;
    const cos_a = Math.cos(a);
    const sin_a = Math.sin(a);
    const cos_sq_a = cos_a * cos_a;
    const b = theta1 - 2.0 * theta2;
    const sin_b = Math.sin(b);
    const th1_dot_sq = theta_dot1 * theta_dot1;
    const th2_dot_sq = theta_dot2 * theta_dot2;
    const sin_th1 = Math.sin(theta1);
    const sin_th2 = Math.sin(theta2);

    // Denominators for the two equations are similar
    const denom = M - m2 * cos_sq_a;
    const denom1 = -denom * l1;
    const denom2 = denom * l2;

    // Numerator for angular acceleration 1
    const term1 = l1 * m2 * th1_dot_sq * sin_a * cos_a;
    const term2 = th2_dot_sq * l2 * m2 * sin_a;
    const term3 = g * m1 * sin_th1;
    const term4 = g * m2_half * sin_th1;
    const term5 = g * m2_half * sin_b;
    const num1 = term1 + term2 + term3 + term4 + term5;

    // Numerator for angular acceleration 2
    const term6 = -th1_dot_sq * l1 * sin_a;
    const term7 = g * sin_th2;
    const half_one = -M * (term6 + term7);
    const term8 = th2_dot_sq * l2 * m2 * sin_a;
    const term9 = g * M * sin_th1;
    const half_two = (term8 + term9) * cos_a;
    const num2 = half_one + half_two;

    // Angular acceleration
    const alpha1 = num1 / denom1;
    const alpha2 = num2 / denom2;

    return [theta_dot1, alpha1, theta_dot2, alpha2];
  }

  /**
   * Render the phase plot for the angles and angular velocities
   * @param {Point} origin The origin of the phase plot in pixels
   * @param {number} theta_scale The scale of the angle axis in pixels/radian
   * @param {number} theta_dot_scale The scale of the angular velocity axis in pixels / (rad/sec)
   * @returns {[GroupPrimitive, GroupPrimitive]} The two phase plots
   */
  render_phase(origin, theta_scale, theta_dot_scale) {
    const theta_dir = Point.DIR_X.scale(theta_scale);
    const theta_dot_dir = Point.DIR_Y.scale(-theta_dot_scale);

    const states = [...this.history];
    const points1 = states.map(([theta1, theta_dot1, ,]) => {
      const reduced_theta = mod(theta1 - PI, TAU) - PI;
      return origin
        .add(theta_dir.scale(reduced_theta))
        .add(theta_dot_dir.scale(theta_dot1));
    });

    const points2 = states.map(([, , theta2, theta_dot2]) => {
      const reduced_theta = mod(theta2 - PI, TAU) - PI;
      return origin
        .add(theta_dir.scale(reduced_theta))
        .add(theta_dot_dir.scale(theta_dot2));
    });

    const phase1 = [];
    const phase2 = [];
    for (let i = 0; i < states.length - 1; i++) {
      const a1 = points1[i];
      const b1 = points1[i + 1];

      // If we looped around the boundary, don't draw the line
      if (Math.abs(a1.x - b1.x) < 0.8 * TAU) {
        const line1 = new LinePrimitive(a1, b1);
        phase1.push(line1);
      }

      const a2 = points2[i];
      const b2 = points2[i + 1];
      if (Math.abs(a2.x - b2.x) < 0.8 * TAU) {
        const line2 = new LinePrimitive(a2, b2);
        phase2.push(line2);
      }
    }

    return [
      new GroupPrimitive(phase1, { style: STYLE_PHASE1 }),
      new GroupPrimitive(phase2, { style: STYLE_PHASE2 }),
    ];
  }

  /**
   * Render position/velocity axes on the screen for a phase plot
   * @param {Point} origin The origin of the coordinate system
   * @param {number} theta_scale Scale of the position axis in pixels/meter
   * @param {number} theta_dot_scale Scale of the velocity axis in pixels / (m/s)
   * @returns {GroupPrimitive}
   */
  render_phase_axes(origin, theta_scale, theta_dot_scale) {
    const theta_dir = Point.DIR_X.scale(theta_scale);
    const theta_dot_dir = Point.DIR_Y.scale(-theta_dot_scale);

    const primitives = [
      new LinePrimitive(origin.sub(theta_dir), origin.add(theta_dir)),
      new LinePrimitive(origin.sub(theta_dot_dir), origin.add(theta_dot_dir)),
    ];

    return new GroupPrimitive(primitives, { style: STYLE_AXIS });
  }

  angles_to_positions(origin, theta1, theta2) {
    const offset1 = Point.dir_from_angle(Math.PI / 2 - theta1).scale(
      this.pendulum1.length * PIXELS_PER_METER
    );
    const offset2 = Point.dir_from_angle(Math.PI / 2 - theta2).scale(
      this.pendulum2.length * PIXELS_PER_METER
    );

    const bob_position1 = origin.add(offset1);
    const bob_position2 = bob_position1.add(offset2);

    return [bob_position1, bob_position2];
  }

  render_history(origin) {
    const states = [...this.history];
    const positions = states.map(([theta1, , theta2]) => {
      return this.angles_to_positions(origin, theta1, theta2);
    });

    const history1 = [];
    const history2 = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const [prev1, prev2] = positions[i];
      const [curr1, curr2] = positions[i + 1];

      const line1 = new LinePrimitive(prev1, curr1);
      const line2 = new LinePrimitive(prev2, curr2);

      history1.push(line1);
      history2.push(line2);
    }

    return [
      new GroupPrimitive(history1, { style: STYLE_PHASE1 }),
      new GroupPrimitive(history2, { style: STYLE_PHASE2 }),
    ];
  }

  /**
   * Render the double pendulum animation
   * @param {Point} origin The point to draw the animation at in pixels
   * @returns {GroupPrimitive}
   */
  render(origin) {
    const [theta1, , theta2] = this.simulation.state;
    const [bob_position1, bob_position2] = this.angles_to_positions(
      origin,
      theta1,
      theta2
    );

    const arm1 = new LinePrimitive(origin, bob_position1);
    const arm2 = new LinePrimitive(bob_position1, bob_position2);

    const bob1 = new CirclePrimitive(
      bob_position1,
      PIXELS_PER_METER * this.pendulum1.bob_radius
    );
    const bob2 = new CirclePrimitive(
      bob_position2,
      PIXELS_PER_METER * this.pendulum2.bob_radius
    );

    return new GroupPrimitive([arm1, arm2, bob1, bob2], { style: ARM_STYLE });
  }
}
