import { ControlPoint } from "./ControlPoint.js";
import { Point, Direction } from "../pga2d/objects.js";
import { Rect } from "./Rect.js";

export const CONNECT_RIGHT = 0b0001;
export const CONNECT_UP = 0b0010;
export const CONNECT_LEFT = 0b0100;
export const CONNECT_DOWN = 0b1000;

const ConnectionDirection = {
  RIGHT: 0,
  UP: 1,
  LEFT: 2,
  DOWN: 3,
};
Object.freeze(ConnectionDirection);

const DIR_LEFT = Direction.X.neg();
const DIR_RIGHT = Direction.X;
const DIR_UP = Direction.Y;
const DIR_DOWN = Direction.Y.neg();

function has_flag(flags, flag) {
  return (flags & flag) === flag;
}

export class CoralTile {
  constructor(quad, connection_flags) {
    this.quad = quad;
    this.connection_flags = connection_flags;

    const connects_down = has_flag(this.connection_flags, CONNECT_DOWN);
    const se_position = connects_down
      ? new Point(0.75, 0)
      : new Point(0.5, 0.25);
    const se_dir = connects_down ? DIR_UP : DIR_RIGHT;
    const se = new ControlPoint(se_position, se_dir.scale(0.1));
    const se_vertex_constraint = connects_down
      ? new Rect(0.5, 0, 0.5, 0)
      : new Rect(1, 0, 0, 0.5);

    const connects_right = has_flag(this.connection_flags, CONNECT_RIGHT);
    const ne_position = connects_right
      ? new Point(1, 0.75)
      : new Point(0.75, 0.5);
    const ne_dir = connects_right ? DIR_LEFT : DIR_UP;
    const ne = new ControlPoint(ne_position, ne_dir.scale(0.1));
    const ne_vertex_constraint = connects_right
      ? new Rect(1, 0.5, 0, 0.5)
      : new Rect(0.5, 0.5, 0.5, 0);

    const connects_up = has_flag(this.connection_flags, CONNECT_UP);
    const nw_position = connects_up ? new Point(0.25, 1) : new Point(0.5, 0.75);
    const nw_dir = connects_up ? DIR_DOWN : DIR_LEFT;
    const nw = new ControlPoint(nw_position, nw_dir.scale(0.1));
    const nw_vertex_constraint = connects_up
      ? new Rect(0, 1, 0.5, 0)
      : new Rect(0.5, 0.5, 0, 0.5);

    const connects_left = has_flag(this.connection_flags, CONNECT_LEFT);
    const sw_position = connects_left
      ? new Point(0, 0.25)
      : new Point(0.25, 0.5);
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

  get_constraints() {
    // control point, vertex constraint, tangent constraint
    return this.control_points.map((point, i) => [
      point,
      this.vertex_constraints[i],
      this.tangent_constraints[i],
    ]);
  }
}
