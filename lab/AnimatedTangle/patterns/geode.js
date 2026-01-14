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
import { PALETTE_CORAL, PALETTE_ROCK, Values } from "../theme_colors.js";
import { Oklch } from "../../lablib/Oklch.js";
import { Random } from "../../../sketchlib/random.js";
import { LoopCurve } from "../../lablib/animation/LoopCurve.js";
import { Animated } from "../../lablib/animation/Animated.js";
import { lerp } from "../../../sketchlib/lerp.js";

const STYLE_ROCK1 = new Style({
  stroke: PALETTE_ROCK[Values.MED_DARK],
  width: 4,
});
const STYLE_ROCK2 = new Style({
  stroke: PALETTE_ROCK[Values.MEDIUM],
  width: 4,
});

const DURATION_TOTAL = new Rational(8);
const DURATION_GROW = DURATION_TOTAL.mul(new Rational(2, 3));
const DURATION_PAUSE = DURATION_TOTAL.mul(new Rational(1, 3));

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
  fill: PALETTE_ROCK[Values.DARK],
});

/**
 * @implements {Animated}
 */
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

    const max_width = this.stripe_styles[0].stroke_width;
    this.curve_thickness = LoopCurve.from_timeline(
      new Sequential(
        new ParamCurve(0, max_width, DURATION_GROW),
        new ParamCurve(max_width, max_width, DURATION_PAUSE)
      )
    );

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

  /**
   *
   * @param {number} time
   */
  update(time) {
    const thickness = this.curve_thickness.value(time);

    for (const [i, stripe_style] of this.stripe_styles.entries()) {
      stripe_style.stroke_width = Math.min(thickness, this.max_widths[i]);
    }
  }
}

// TEMP
const GEODE_BOUNDARY = new PolygonPrimitive(
  [
    new Point(250, 625),
    new Point(325, 700),
    new Point(350, 650),
    new Point(375, 650),
    new Point(425, 675),
    new Point(475, 625),
    new Point(450, 525),
    new Point(375, 475),
    new Point(275, 500),
    new Point(250, 550),
  ],
  true
);

const MAX_THICKNESS = 16;

const WIDTHS = [8, 7, 6, 5, 4, 3, 2, 1].map((x) => {
  const max_width = x * MAX_THICKNESS;
  const min_width = max_width - 0.75 * MAX_THICKNESS;
  return lerp(min_width, max_width, Math.random());
});

const PALETTE_AGATE = Random.shuffle(
  Oklch.gradient(
    PALETTE_CORAL[Values.DARK],
    PALETTE_CORAL[Values.LIGHT],
    WIDTHS.length
  )
);

/**
 * @type {Style[]}
 */
const GEODE_STYLES = PALETTE_AGATE.map(
  (x, i) =>
    new Style({
      stroke: x,
      width: WIDTHS[i],
    })
);

export const GEODE = new Geode(GEODE_BOUNDARY, GEODE_STYLES);
