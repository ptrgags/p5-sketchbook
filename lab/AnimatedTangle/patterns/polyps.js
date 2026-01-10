import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Ease } from "../../../sketchlib/Ease.js";
import { mod } from "../../../sketchlib/mod.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../../sketchlib/primitives/LinePrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { Tween } from "../../../sketchlib/Tween.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { PALETTE_CORAL, PALETTE_NAVY, Values } from "../theme_colors.js";

const TENTACLE_MIN = 10;
const TENTACLE_MAX = 30;
const TENTACLE_CIRCLE_RADIUS = 4;

const MOUTH_MIN = 15;
const MOUTH_MAX = 22;
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
    new ParamCurve(MAX_DIST, 0, new Rational(2, 3), Ease.in_cubic),
    new ParamCurve(0, MAX_DIST, new Rational(3), Ease.in_out_cubic)
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

const STYLE_MOUTH_BACK = new Style({
  stroke: PALETTE_CORAL[Values.Dark],
  fill: PALETTE_CORAL[Values.Light],
});

const STYLE_MOUTH_FRONT = new Style({
  fill: PALETTE_NAVY[Values.Medium],
});

const STYLE_TENTACLE_LINES = new Style({
  stroke: PALETTE_CORAL[Values.MedDark],
  width: 2,
});

const STYLE_TENTACLE_CIRCLES = new Style({
  stroke: PALETTE_CORAL[Values.MedDark],
  fill: PALETTE_CORAL[Values.Light],
});

export class Polyp {
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
      style(this.mouth_back, STYLE_MOUTH_BACK),
      style(this.mouth_front, STYLE_MOUTH_FRONT),
      style(this.tentacle_lines, STYLE_TENTACLE_LINES),
      style(this.tentacle_circles, STYLE_TENTACLE_CIRCLES)
    );
  }

  update_position(position) {
    this.position = position;
    this.mouth_back.position = position;
    this.mouth_front.position = position;

    SIXTH_ROOTS.forEach((dir, i) => {
      this.tentacle_lines[i].a = position.add(dir.scale(MOUTH_MIN));
    });
  }

  update(time) {
    // A wave passes from the anchor point outwards
    const extend_signal = CURVE_EXTEND_RADIUS.value(time);

    const extend_t = WAVE_PASSAGE_TO_EXTEND_TIME.get_value(
      extend_signal - this.dist_from_anchor
    );
    const tentacle_r = EXTEND_TENTACLES.get_value(extend_t);

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
