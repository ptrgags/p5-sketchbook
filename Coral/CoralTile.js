import { ControlPoint } from "./ControlPoint.js";
import { Point } from "../pga2d/objects.js";
import { Rect } from "./Rect.js";
import { FlagSet } from "../sketchlib/FlagSet.js";
import { GridDirection } from "../sketchlib/GridDiection.js";

const DIR_LEFT = Point.DIR_X.neg();
const DIR_RIGHT = Point.DIR_X;
const DIR_UP = Point.DIR_Y;
const DIR_DOWN = Point.DIR_Y.neg();

export const Quadrant = {
  SOUTHEAST: 0,
  NORTHEAST: 1,
  NORTHWEST: 2,
  SOUTHWEST: 3,
};
Object.freeze(Quadrant);

export class CoralTile {
  constructor(quad, connection_flags) {
    this.quad = quad;
    const flags = new FlagSet(connection_flags, GridDirection.COUNT);
    this.connection_flags = flags;

    const connects_down = flags.has_flag(GridDirection.DOWN);
    const se_position = connects_down
      ? Point.point(0.75, 0)
      : Point.point(0.5, 0.25);
    const se_dir = connects_down ? DIR_UP : DIR_RIGHT;
    const se = new ControlPoint(se_position, se_dir.scale(0.1));
    const se_vertex_constraint = connects_down
      ? new Rect(0.5, 0, 0.5, 0)
      : new Rect(0.5, 0, 0, 0.5);

    const connects_right = flags.has_flag(GridDirection.RIGHT);
    const ne_position = connects_right
      ? Point.point(1, 0.75)
      : Point.point(0.75, 0.5);
    const ne_dir = connects_right ? DIR_LEFT : DIR_UP;
    const ne = new ControlPoint(ne_position, ne_dir.scale(0.1));
    const ne_vertex_constraint = connects_right
      ? new Rect(1, 0.5, 0, 0.5)
      : new Rect(0.5, 0.5, 0.5, 0);

    const connects_up = flags.has_flag(GridDirection.UP);
    const nw_position = connects_up
      ? Point.point(0.25, 1)
      : Point.point(0.5, 0.75);
    const nw_dir = connects_up ? DIR_DOWN : DIR_LEFT;
    const nw = new ControlPoint(nw_position, nw_dir.scale(0.1));
    const nw_vertex_constraint = connects_up
      ? new Rect(0, 1, 0.5, 0)
      : new Rect(0.5, 0.5, 0, 0.5);

    const connects_left = flags.has_flag(GridDirection.LEFT);
    const sw_position = connects_left
      ? Point.point(0, 0.25)
      : Point.point(0.25, 0.5);
    const sw_dir = connects_left ? DIR_RIGHT : DIR_DOWN;
    const sw = new ControlPoint(sw_position, sw_dir.scale(0.1));
    const sw_vertex_constraint = connects_left
      ? new Rect(0, 0, 0, 0.5)
      : new Rect(0, 0.5, 0.5, 0);

    this.control_points = [se, ne, nw, sw];
    this.vertex_constraints = [
      se_vertex_constraint,
      ne_vertex_constraint,
      nw_vertex_constraint,
      sw_vertex_constraint,
    ];
    this.tangent_constraints = [se_dir, ne_dir, nw_dir, sw_dir];
  }

  is_connected(direction) {
    return this.connection_flags.has_flag(direction);
  }

  get_control_point(quadrant) {
    return this.control_points[quadrant];
  }

  get_constraints() {
    // control point, vertex constraint, tangent constraint
    return this.control_points.map((point, i) => [
      point,
      this.vertex_constraints[i],
      this.tangent_constraints[i],
    ]);
  }
}
