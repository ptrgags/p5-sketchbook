import { BezierPrimitive } from "../sketchlib/rendering/primitives.js";

export class Spline {
  constructor(control_points) {
    this.control_points = control_points;
  }

  log_params() {
    console.log("current control points:");
    for (const point of this.control_points) {
      console.log(
        "p:",
        point.position.x.toPrecision(3),
        point.position.y.toPrecision(3)
      );
      console.log(
        "v:",
        point.tangent.x.toPrecision(3),
        point.tangent.y.toPrecision(3)
      );
    }
  }

  /**
   * Transform the control points to world coordinates and return them as
   * Bezier primitives.
   * @returns {BezierPrimitive[]} Array of bezier curve segments to render
   */
  to_bezier_world() {
    // Map each control point and pair of tangent points to world coordinates
    const points_world = this.control_points.map(([quad, control_point]) => {
      const position = quad.uv_to_world(control_point.position);
      const forward = quad.uv_to_world(control_point.forward_point);
      const backward = quad.uv_to_world(control_point.backward_point);

      return [position, forward, backward];
    });

    // Now iterate over the control points pairwise and connect
    // start -> start + d_start -> end - d_end -> end
    return points_world.map((x, i) => {
      const [start, start_forward] = x;
      const [end, , end_backward] = points_world[(i + 1) % points_world.length];
      return new BezierPrimitive(start, start_forward, end_backward, end);
    });
  }
}
