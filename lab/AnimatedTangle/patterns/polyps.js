import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Ease } from "../../../sketchlib/Ease.js";
import { mod } from "../../../sketchlib/mod.js";
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

const EXTEND_TENTACLES = Tween.scalar(
  TENTACLE_MIN,
  TENTACLE_MAX,
  0,
  1,
  Ease.in_out_cubic
);
const OPEN_MOUTH = Tween.scalar(MOUTH_MIN, MOUTH_MAX, 0, 1, Ease.in_out_cubic);

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
      this.mouth_front,
      ...this.tentacle_lines,
      ...this.tentacle_circles
    );
  }

  update(time) {
    const loop_t = mod(time, 1.0);
    const tentacle_r = EXTEND_TENTACLES.get_value(loop_t);

    const mouth_r = OPEN_MOUTH.get_value(loop_t);
    this.mouth_back.radius = mouth_r;

    SIXTH_ROOTS.forEach((dir, i) => {
      const tentacle_end = this.position.add(dir.scale(tentacle_r));

      this.tentacle_circles[i].position = tentacle_end;
      this.tentacle_lines[i].b = tentacle_end;
    });
  }

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
