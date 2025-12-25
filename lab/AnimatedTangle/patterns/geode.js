import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Color } from "../../../sketchlib/Color.js";
import { BeziergonPrimitive } from "../../../sketchlib/primitives/BeziergonPrimitive.js";
import { BezierPrimitive } from "../../../sketchlib/primitives/BezierPrimitive.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../../sketchlib/primitives/ClipPrimitive.js";
import { PolygonPrimitive } from "../../../sketchlib/primitives/PolygonPrimitive.js";
import { Primitive } from "../../../sketchlib/primitives/Primitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { make_stripes } from "./stripes.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";

const STYLE_ROCK = new Style({
  stroke: Color.from_hex_code("#555555"),
  width: 4,
});

const ROCK_CIRCLE = new CirclePrimitive(new Point(350, 600), 150);

const ROCK_STRIPES1 = make_stripes(
  new Point(350, 600),
  new Direction(2, 1).normalize(),
  6,
  new Direction(400, 400),
  0
);
const ROCK_STRIPES2 = make_stripes(
  new Point(350, 600),
  new Direction(2, -1).normalize(),
  6,
  new Direction(400, 400),
  0
);

const STYLE_INSIDE_GEODE = new Style({
  fill: Color.from_hex_code("#222222"),
});

export class Geode {
  /**
   * Constructor
   * @param {Primitive} boundary Primitive that can be drawn with lines (e.g. PolygonPrimitive)
   * @param {Style[]} stripe_styles styles, listed from thickest to smallest
   */
  constructor(boundary, stripe_styles) {
    this.max_widths = stripe_styles.map((x) => x.stroke_width);

    this.stripe_styles = stripe_styles;

    const layers = stripe_styles.map((x) => style(boundary, x));
    this.primitive = group(
      new ClipPrimitive(
        new Mask(ROCK_CIRCLE),
        group(
          style(ROCK_STRIPES1, STYLE_ROCK),
          style(ROCK_STRIPES2, STYLE_ROCK)
        )
      ),
      style(boundary, STYLE_INSIDE_GEODE),
      new ClipPrimitive(new Mask(boundary), group(...layers))
    );
  }

  update(anim) {
    const thicc = anim.get_curve_val("geode");

    for (const [i, stripe_style] of this.stripe_styles.entries()) {
      stripe_style.stroke_width = Math.min(thicc, this.max_widths[i]);
    }
  }

  render() {
    return this.primitive;
  }

  /**
   *
   * @param {Rational} duration
   * @returns {{[key:string]: import("../../lablib/music/Timeline.js").Timeline<ParamCurve>}}
   */
  make_curves(duration) {
    const grow_duration = duration.mul(new Rational(2, 3));
    const pause_duration = duration.mul(new Rational(1, 3));
    const max_width = this.stripe_styles[0].stroke_width;
    return {
      // go from 0 to the thickest width
      geode: new Sequential(
        new ParamCurve(0, max_width, grow_duration),
        new ParamCurve(max_width, max_width, pause_duration)
      ),
    };
  }
}

// TEMP
const GEODE_BOUNDARY = new PolygonPrimitive(
  [
    new Point(250, 625),
    new Point(450, 650),
    new Point(400, 500),
    new Point(300, 525),
  ],
  true
);

const WIDTHS = [8, 7, 6, 5, 4, 3, 2, 1].map((x) => 8 * x);

/**
 * @type {[Color, number][]}
 */
const GEODE_BANDS = "7b2cbf-3c096c-c77dff-240046-5a189a-10002b-e0aaff-9d4edd"
  .split("-")
  .map((x, i) => [Color.from_hex_code(x), WIDTHS[i]]);

const GEODE_STYLES = GEODE_BANDS.map(
  ([color, width]) => new Style({ stroke: color, width })
);

export const GEODE = new Geode(GEODE_BOUNDARY, GEODE_STYLES);
