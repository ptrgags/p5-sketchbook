import { Sequential } from "../../lablib/music/Timeline.js";
import { Rational } from "../../lablib/Rational.js";
import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { Mask } from "../../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../../sketchlib/primitives/ClipPrimitive.js";
import { PolygonPrimitive } from "../../../sketchlib/primitives/PolygonPrimitive.js";
import { Primitive } from "../../../sketchlib/primitives/Primitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { make_stripes } from "./stripes.js";
import { ParamCurve } from "../../lablib/animation/ParamCurve.js";
import { PALETTE_CORAL, PALETTE_ROCK } from "../theme_colors.js";
import { Oklch } from "../../lablib/Oklch.js";
import { Random } from "../../../sketchlib/random.js";

const STYLE_ROCK1 = new Style({
  stroke: PALETTE_ROCK[1].to_srgb(),
  width: 4,
});
const STYLE_ROCK2 = new Style({
  stroke: PALETTE_ROCK[2].to_srgb(),
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
  fill: PALETTE_ROCK[0].to_srgb(),
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
          style(ROCK_STRIPES1, STYLE_ROCK1),
          style(ROCK_STRIPES2, STYLE_ROCK2)
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

const PALETTE_AGATE = Random.shuffle(
  Oklch.gradient(PALETTE_CORAL[0], PALETTE_CORAL.at(-1), WIDTHS.length)
);

/**
 * @type {Style[]}
 */
const GEODE_STYLES = PALETTE_AGATE.map(
  (x, i) =>
    new Style({
      stroke: x.to_srgb(),
      width: WIDTHS[i],
    })
);

export const GEODE = new Geode(GEODE_BOUNDARY, GEODE_STYLES);
