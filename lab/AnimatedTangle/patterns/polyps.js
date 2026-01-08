import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { Tween } from "../../../sketchlib/Tween.js";

const TENTACLE_MIN = 10;
const TENTACLE_MAX = 30;
const TENTACLE_CIRCLE_RADIUS = 3;
const MOUTH_MIN = 15;
const MOUTH_MAX = 20;
const SIXTH_ROOTS = Direction.roots_of_unity(6);

const EXTEND_TENTACLES = Tween.scalar(TENTACLE_MIN, TENTACLE_MAX, 0, 1);
const OPEN_MOUTH = Tween.scalar(MOUTH_MIN, MOUTH_MAX, 0, 1);

class Polyp {
  /**
   *
   * @param {Point} position
   */
  constructor(position) {
    this.position = position;

    this.mouth_back = new CirclePrimitive(this.position, MOUTH_MAX);
    this.mouth_front = new CirclePrimitive(this.position, MOUTH_MIN);

    this.tentacle_lines = SIXTH_ROOTS.map((dir) => {
      const anchor_point = this.position.add(dir.scale(MOUTH_MIN));
      const extend_point = this.position.add(dir.scale(TENTACLE_MAX));
      return new LinePrimitive(anchor_point, extend_point);
    });

    this.tentacle_circles = SIXTH_ROOTS.map((dir) => {
      const position = this.position.add(dir.scale(TENTACLE_MAX));
      return new CirclePrimitive(position, TENTACLE_CIRCLE_RADIUS);
    });

    this.primitive = group(
      this.mouth_back,
      ...this.tentacle_lines,
      ...this.tentacle_circles,
      this.mouth_front
    );
  }

  update(time) {}

  render() {
    return this.primitive;
  }
}

export class Polyps {
  constructor() {
    this.polyps = [new Polyp(new Point(125, 500))];

    this.primitive = group(...this.polyps.map((x) => x.render()));
  }

  update(time) {
    this.polyps.forEach((x) => x.update(time));
  }

  render() {
    return this.primitive;
  }
}
