import { ControlPoint } from "./ControlPoint.js";
import { vec2 } from "./vector.js";

export const CONNECT_RIGHT = 0b0001;
export const CONNECT_UP = 0b0010;
export const CONNECT_LEFT = 0b0100;
export const CONNECT_DOWN = 0b1000;

const DIR_LEFT = vec2(-0.1, 0);
const DIR_RIGHT = vec2(0.1, 0);
const DIR_UP = vec2(0, 0.1);
const DIR_DOWN = vec2(0, -0.1);

function has_flag(flags, flag) {
  return (flags & flag) === flag;
}

export class CoralTile {
  constructor(quad, connection_flags) {
    this.quad = quad;
    this.connection_flags = connection_flags;

    const se_position = has_flag(this.connection_flags, CONNECT_DOWN)
      ? vec2(0.75, 0)
      : vec2(0.5, 0.25);
    const se_dir = has_flag(this.connection_flags, CONNECT_DOWN)
      ? DIR_UP
      : DIR_RIGHT;
    const se = new ControlPoint(se_position, se_dir);

    const ne_position = has_flag(this.connection_flags, CONNECT_RIGHT)
      ? vec2(1, 0.75)
      : vec2(0.75, 0.5);
    const ne_dir = has_flag(this.connection_flags, CONNECT_RIGHT)
      ? DIR_LEFT
      : DIR_UP;
    const ne = new ControlPoint(ne_position, ne_dir);

    const nw_position = has_flag(this.connection_flags, CONNECT_UP)
      ? vec2(0.25, 1)
      : vec2(0.5, 0.75);
    const nw_dir = has_flag(this.connection_flags, CONNECT_UP)
      ? DIR_DOWN
      : DIR_LEFT;
    const nw = new ControlPoint(nw_position, nw_dir);

    const sw_position = has_flag(this.connection_flags, CONNECT_LEFT)
      ? vec2(0, 0.25)
      : vec2(0.25, 0.5);
    const sw_dir = has_flag(this.connection_flags, CONNECT_LEFT)
      ? DIR_RIGHT
      : DIR_DOWN;
    const sw = new ControlPoint(sw_position, sw_dir);

    this.control_points = [se, ne, nw, sw];
  }
}
