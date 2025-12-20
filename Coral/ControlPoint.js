import { Point } from "../pga2d/objects.js";

export class ControlPoint {
  constructor(position, tangent) {
    this.position = position;
    this.tangent = tangent;
  }

  get forward_point() {
    return this.position.add(this.tangent);
  }

  get backward_point() {
    return this.position.sub(this.tangent);
  }

  to_json() {
    return {
      position: [this.position.x, this.position.y],
      tangent: [this.tangent.x, this.tangent.y],
    };
  }

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
    return new ControlPoint(new Point(x, y), Point.direction(dx, dy));
  }
}
