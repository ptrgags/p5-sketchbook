import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";

export class ControlPoint {
  /**
   * Constructor
   * @param {Point} position
   * @param {Direction} tangent
   */
  constructor(position, tangent) {
    this.position = position;
    this.tangent = tangent;
  }

  /**
   * @type {Point}
   */
  get forward_point() {
    return this.position.add(this.tangent);
  }

  /**
   * @type {Point}
   */
  get backward_point() {
    return this.position.add(this.tangent.neg());
  }

  to_json() {
    return {
      position: [this.position.x, this.position.y],
      tangent: [this.tangent.x, this.tangent.y],
    };
  }

  /**
   * Parse a control point from JSON
   * @param {object} json A JSON object
   * @returns {ControlPoint} The parsed ControlPoint
   */
  static parse_json(json) {
    const { position, tangent } = json;

    if (!Array.isArray(position) || position.length !== 2) {
      throw new Error("position must be an array of two numbers");
    }

    if (!Array.isArray(tangent) || tangent.length !== 2) {
      throw new Error("tangent must be an array of two numbers");
    }

    const [x, y] = position;
    const [dx, dy] = tangent;
    return new ControlPoint(new Point(x, y), new Direction(dx, dy));
  }
}
