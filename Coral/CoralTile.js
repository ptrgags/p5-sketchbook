import { ControlPoint } from "./ControlPoint.js";
import { Point } from "../pga2d/objects.js";
import { Rect } from "./Rect.js";
import { FlagSet } from "../sketchlib/FlagSet.js";
import { Direction } from "../sketchlib/Direction.js";

const DIR_LEFT = Point.DIR_X.neg();
const DIR_RIGHT = Point.DIR_X;
const DIR_UP = Point.DIR_Y;
const DIR_DOWN = Point.DIR_Y.neg();

/**
 * @enum {number}
 */
export const Quadrant = {
  SOUTHEAST: 0,
  NORTHEAST: 1,
  NORTHWEST: 2,
  SOUTHWEST: 3,
};
Object.freeze(Quadrant);

export class CoralTile {
  constructor(quad, connection_flags, control_points) {
    this.quad = quad;
    this.connection_flags = connection_flags;

    const connects_down = connection_flags.has_flag(Direction.DOWN);
    const connects_right = connection_flags.has_flag(Direction.RIGHT);
    const connects_up = connection_flags.has_flag(Direction.UP);
    const connects_left = connection_flags.has_flag(Direction.LEFT);

    const se_dir = connects_down ? DIR_UP : DIR_RIGHT;
    const ne_dir = connects_right ? DIR_LEFT : DIR_UP;
    const nw_dir = connects_up ? DIR_DOWN : DIR_LEFT;
    const sw_dir = connects_left ? DIR_RIGHT : DIR_DOWN;
    this.tangent_constraints = [se_dir, ne_dir, nw_dir, sw_dir];

    if (control_points !== undefined) {
      this.control_points = control_points;
    } else {
      const se_position = connects_down
        ? Point.point(0.75, 0)
        : Point.point(0.5, 0.25);
      const ne_position = connects_right
        ? Point.point(1, 0.75)
        : Point.point(0.75, 0.5);
      const nw_position = connects_up
        ? Point.point(0.25, 1)
        : Point.point(0.5, 0.75);
      const sw_position = connects_left
        ? Point.point(0, 0.25)
        : Point.point(0.25, 0.5);
      const se = new ControlPoint(se_position, se_dir.scale(0.1));
      const ne = new ControlPoint(ne_position, ne_dir.scale(0.1));
      const nw = new ControlPoint(nw_position, nw_dir.scale(0.1));
      const sw = new ControlPoint(sw_position, sw_dir.scale(0.1));
      this.control_points = [se, ne, nw, sw];
    }

    const se_vertex_constraint = connects_down
      ? new Rect(0.5, 0, 0.5, 0)
      : new Rect(0.5, 0, 0, 0.5);
    const ne_vertex_constraint = connects_right
      ? new Rect(1, 0.5, 0, 0.5)
      : new Rect(0.5, 0.5, 0.5, 0);
    const nw_vertex_constraint = connects_up
      ? new Rect(0, 1, 0.5, 0)
      : new Rect(0.5, 0.5, 0, 0.5);
    const sw_vertex_constraint = connects_left
      ? new Rect(0, 0, 0, 0.5)
      : new Rect(0, 0.5, 0.5, 0);
    this.vertex_constraints = [
      se_vertex_constraint,
      ne_vertex_constraint,
      nw_vertex_constraint,
      sw_vertex_constraint,
    ];
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

  to_json() {
    return {
      connections: this.connection_flags.to_int(),
      control_points: this.control_points.map((x) => x.to_json()),
    };
  }

  static parse_json(json, quad) {
    const { connections, control_points } = json;

    if (connections === undefined || typeof connections !== "number") {
      throw new Error("connections must be an int");
    }

    const connection_flags = new FlagSet(connections, Direction.COUNT);

    if (!Array.isArray(control_points) || control_points.length !== 4) {
      throw new Error("control_points must be an array of length 4");
    }

    const parsed_control_points = control_points.map((x) =>
      ControlPoint.parse_json(x)
    );

    return new CoralTile(quad, connection_flags, parsed_control_points);
  }
}
