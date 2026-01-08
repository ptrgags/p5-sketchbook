import { Point } from "../../../pga2d/Point.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";

class Polyp {
  /**
   *
   * @param {Point} position
   */
  constructor(position) {
    this.position = position;
    this.primitive = new CirclePrimitive(this.position, 25);
  }

  update(time) {}

  render() {
    return this.primitive;
  }
}

export class Polyps {
  constructor() {
    this.polyps = [new Polyp(new Point(100, 500))];

    this.primitive = group(...this.polyps.map((x) => x.render()));
  }

  update(time) {
    this.polyps.forEach((x) => x.update(time));
  }

  render() {
    return this.primitive;
  }
}
