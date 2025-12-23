import { ParamCurve } from "../../lab/lablib/music/ParamCurve.js";
import { Rational } from "../../lab/lablib/Rational.js";
import { Point } from "../../pga2d/Point.js";
import { Color } from "../../sketchlib/Color.js";
import { BeziergonPrimitive } from "../../sketchlib/primitives/BeziergonPrimitive.js";
import { BezierPrimitive } from "../../sketchlib/primitives/BezierPrimitive.js";
import { Mask } from "../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../sketchlib/primitives/ClipPrimitive.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { Primitive } from "../../sketchlib/primitives/Primitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
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
    this.primitive = new ClipPrimitive(new Mask(boundary), group(...layers));
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
   * @returns {{[key:string]: import("../../lab/lablib/music/Timeline.js").Timeline<ParamCurve>}}
   */
  make_curves(duration) {
    return {
      // go from 0 to the thickest width
      geode: new ParamCurve(0, this.stripe_styles[0].stroke_width, duration),
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

/**
 * @type {[Color, number][]}
 */
const GEODE_BANDS = [
  [Color.RED, 200],
  [Color.GREEN, 180],
  [Color.RED, 160],
  [Color.BLUE, 120],
  [Color.CYAN, 80],
  [Color.MAGENTA, 60],
  [Color.GREEN, 20],
];
const GEODE_STYLES = GEODE_BANDS.map(
  ([color, width]) => new Style({ stroke: color, width })
);

export const GEODE = new Geode(GEODE_BOUNDARY, GEODE_STYLES);
