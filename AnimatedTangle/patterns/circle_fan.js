import { Sequential } from "../../sketchlib/music/Timeline.js";
import { Rational } from "../../sketchlib/Rational.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { Circle } from "../../sketchlib/primitives/Circle.js";
import { group, style, xform } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { Hold, make_param } from "../../sketchlib/animation/ParamCurve.js";
import { lerp } from "../../sketchlib/lerp.js";
import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { Motor } from "../../sketchlib/pga2d/versors.js";
import { Transform } from "../../sketchlib/primitives/Transform.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import {
  PALETTE_CORAL,
  PALETTE_NAVY,
  PALETTE_SKY,
  Values,
} from "../theme_colors.js";
import { Ease } from "../../sketchlib/Ease.js";
import { LoopCurve } from "../../sketchlib/animation/LoopCurve.js";
import { Animated } from "../../sketchlib/animation/Animated.js";

const CENTER = new Point(500, 300);
const BAND_THICKNESS = 50;
const MAX_RADII = [5, 4, 3, 2, 1].map((x) => x * BAND_THICKNESS);
const CIRCLE_COUNT = MAX_RADII.length;

const EXPAND_DURATION = new Rational(3, CIRCLE_COUNT);
const PAUSE_DURATION = new Rational(1);

const RADIUS_STEPS = [];
for (let i = 0; i < CIRCLE_COUNT; i++) {
  RADIUS_STEPS.push(
    make_param(i * 50, (i + 1) * 50, EXPAND_DURATION, Ease.in_out_cubic),
  );
}

const CURVE_RADIUS = LoopCurve.from_timeline(
  new Sequential(
    ...RADIUS_STEPS,
    new Hold(PAUSE_DURATION),
    make_param(
      CIRCLE_COUNT * 50,
      0,
      EXPAND_DURATION.mul(new Rational(CIRCLE_COUNT)),
      Ease.in_out_cubic,
    ),
  ),
);

const STYLE_CIRCLES = new Style({
  fill: PALETTE_NAVY[Values.MED_LIGHT],
  stroke: PALETTE_SKY[Values.LIGHT],
  width: 5,
});

const STYLE_DIAMONDS = new Style({
  fill: PALETTE_CORAL[Values.MED_LIGHT],
  stroke: PALETTE_NAVY[Values.MEDIUM],
  width: 2,
});

/**
 * Compute the midpoints between a list of values
 * @param {number[]} values Array of values
 * @returns {number[]} A new array of the midpoints. It has one less element
 * than the input array
 */
function pairwise_midpoints(values) {
  const result = new Array(values.length - 1);
  for (let i = 0; i < values.length - 1; i++) {
    const a = values[i];
    const b = values[i + 1];
    result[i] = lerp(a, b, 0.5);
  }
  return result;
}

function diamond_angles() {
  const ANGLE_START = Math.PI;
  const ANGLE_END = (3 * Math.PI) / 2;
  const first_row = [lerp(ANGLE_START, ANGLE_END, 0.5)];

  const rows = [first_row];
  for (let i = 0; i < CIRCLE_COUNT - 1; i++) {
    const prev_row = rows.at(-1);
    const midpoints = pairwise_midpoints(prev_row);
    const start = lerp(ANGLE_START, prev_row[0], 0.5);
    const end = lerp(prev_row.at(-1), ANGLE_END, 0.5);
    const row = [start, ...midpoints, end];
    rows.push(row);
  }
  rows.reverse();

  return rows;
}

const DIAMOND_ANGLES = diamond_angles();

function make_diamond(angle) {
  const outward = Direction.from_angle(angle);
  const right = outward.rot90();
  return new PolygonPrimitive(
    [
      CENTER.add(outward.scale(0.25 * BAND_THICKNESS)),
      CENTER.add(right.scale(-0.125 * BAND_THICKNESS)),
      CENTER.add(outward.scale(-0.25 * BAND_THICKNESS)),
      CENTER.add(right.scale(0.125 * BAND_THICKNESS)),
    ],
    true,
  );
}

/**
 * @implements {Animated}
 */
class CircleFan {
  constructor() {
    /**
     * @type {GroupPrimitive[][]}
     */
    this.diamonds = DIAMOND_ANGLES.map((row, i) => {
      return row.map((angle) => {
        const diamond = make_diamond(angle);
        const offset = Direction.from_angle(angle).scale(0.01);
        return xform(diamond, new Transform(offset));
      });
    });

    this.circles = MAX_RADII.map((r) => {
      return new Circle(CENTER, r);
    });

    // To render correctly we need to interleave the circles and diamonds
    const layers = MAX_RADII.map((_r, i) => {
      const circle = style(this.circles[i], STYLE_CIRCLES);
      const diamond_row = style(this.diamonds[i], STYLE_DIAMONDS);
      return group(circle, diamond_row);
    });

    this.primitive = group(...layers);
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    const r = CURVE_RADIUS.value(time);

    for (const [i, max_radius] of MAX_RADII.entries()) {
      const outer_radius = Math.min(r, max_radius);
      this.circles[i].radius = outer_radius;
      const diamond_r = outer_radius - 0.5 * BAND_THICKNESS;

      // Note: When the radius is 0, the diamonds are slightly out of frame
      this.diamonds[i].forEach((x, j) => {
        const angle = DIAMOND_ANGLES[i][j];
        x.transform.translation = Direction.from_angle(angle).scale(diamond_r);
      });
    }
  }
}

export const CIRCLE_FAN = new CircleFan();
