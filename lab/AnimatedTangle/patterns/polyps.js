import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Ease } from "../../../sketchlib/Ease.js";
import { mod } from "../../../sketchlib/mod.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { Tween } from "../../../sketchlib/Tween.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";

const TENTACLE_MIN = 10;
const TENTACLE_MAX = 30;
const TENTACLE_CIRCLE_RADIUS = 4;

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

const ANCHOR_POINT = new Point(0, 600);

const MAX_DIST = 600;
const CURVE_EXTEND_RADIUS = LoopCurve.from_timeline(
  new Sequential(
    new ParamCurve(MAX_DIST, 0, new Rational(1, 4)),
    new ParamCurve(0, MAX_DIST, new Rational(3, 2))
  )
);

const TENTACLE_EXTEND_LENGTH = 200;

/**
 * How to explain this...
 * The signal to open/close the polyps eminates from the anchor point.
 * When the wave hits the polyp's center, it starts to open up.
 *
 * wave_passage = (wave_r - polyp.dist_from_anchor)
 * @type {Tween<number>}
 */
const WAVE_PASSAGE_TO_EXTEND_TIME = Tween.scalar(
  0,
  1,
  0,
  TENTACLE_EXTEND_LENGTH
);

class Polyp {
  /**
   *
   * @param {Point} position
   */
  constructor(position) {
    this.position = position;
    this.dist_from_anchor = this.position.dist(ANCHOR_POINT);

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
    // A wave passes from the anchor point outwards
    const extend_signal = CURVE_EXTEND_RADIUS.value(time);

    const extend_t = WAVE_PASSAGE_TO_EXTEND_TIME.get_value(
      extend_signal - this.dist_from_anchor
    );
    const tentacle_r = EXTEND_TENTACLES.get_value(extend_t);

    const loop_t = mod(time, 1.0);
    const mouth_r = OPEN_MOUTH.get_value(extend_t);
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
    this.polyps = [
      new Polyp(new Point(85, 255)),
      new Polyp(new Point(125, 275)),
      new Polyp(new Point(110, 325)),
      new Polyp(new Point(225, 330)),
      new Polyp(new Point(140, 355)),
      new Polyp(new Point(185, 360)),
      new Polyp(new Point(35, 360)),
      new Polyp(new Point(85, 380)),
      new Polyp(new Point(140, 410)),
      new Polyp(new Point(50, 410)),
      new Polyp(new Point(100, 450)),
      new Polyp(new Point(160, 460)),
      new Polyp(new Point(30, 465)),
      new Polyp(new Point(125, 500)),
      new Polyp(new Point(35, 525)),
      new Polyp(new Point(75, 545)),
      new Polyp(new Point(145, 550)),
      new Polyp(new Point(180, 580)),
      new Polyp(new Point(60, 590)),
      new Polyp(new Point(10, 610)),
      new Polyp(new Point(55, 650)),
    ];
    console.log(this.polyps.map((x) => x.dist_from_anchor));

    this.primitive = group(...this.polyps.map((x) => x.render()));
  }

  update(time) {
    this.polyps.forEach((x) => x.update(time));
  }

  render() {
    return this.primitive;
  }
}
