import { Polar } from "../sketchlib/Polar.js";

// Percentage of the petal size for offsetting bezier control points
const CONTROL_POINT_OFFSET = 0.75;
// Half the angular size of the petal in radians.
const HALF_ANGULAR_SIZE = 0.2;

/**
 * A class to handle the math of drawing the sunflower petals
 * using polar coordinates.
 */
export class Petal {
  constructor(anchor_point, size) {
    // The petal is measured relative to the anchor point
    const { r, theta } = anchor_point;

    // inner point
    const r_start = Math.max(r - 2 * size, 0);
    // The inner part of the petal is a v shape from the start to two
    // side points at this radius
    const r_sides = Math.max(r - size, 0);
    const r_control_points = r_sides + CONTROL_POINT_OFFSET * size;
    // Tip of the petal
    const r_tip = r + size;
    // Bezier control point radially inward from petal
    const r_tip_control_point = r_tip - CONTROL_POINT_OFFSET * size;

    // All the vertices either are on the center line at the
    // theta of the anchor point, or offset clockwise or counter-clockwise
    const theta_cw = theta - HALF_ANGULAR_SIZE;
    const theta_ccw = theta + HALF_ANGULAR_SIZE;

    // Vertices (including bezier control points). see draw_petal() in the
    // main sketch
    this.start = new Polar(r_start, theta);
    this.side_ccw = new Polar(r_sides, theta_ccw);
    this.side_cw = new Polar(r_sides, theta_cw);
    this.control_ccw = new Polar(r_control_points, theta_ccw);
    this.control_cw = new Polar(r_control_points, theta_cw);
    this.control_tip = new Polar(r_tip_control_point, theta);
    this.tip = new Polar(r_tip, theta);
  }
}
