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

/**
 * (color, thickness_from_boundary)
 * @typedef {[Color, number]} Stripe
 */

export class Geode {
  /**
   * Constructor
   * @param {Primitive} boundary Primitive that can be drawn with lines (e.g. PolygonPrimitive)
   * @param {Stripe[]} stripes Stripes, listed from thickest to smallest
   */
  constructor(boundary, stripes) {
    this.boundary = boundary;
    this.stripes = stripes;
  }

  render() {
    const layers = this.stripes.map(([color, thickness]) => {
      return style(
        this.boundary,
        new Style({ stroke: color, width: thickness })
      );
    });

    return new ClipPrimitive(new Mask(this.boundary), group(...layers));
  }
}

// TEMP
const GEODE_BOUNDARY = new PolygonPrimitive(
  [
    new Point(350, 650),
    new Point(500, 700),
    new Point(400, 500),
    new Point(300, 525),
  ],
  true
);

/**
 * @type {[Color, number][]}
 */
const STRIPES = [
  [Color.RED, 200],
  [Color.GREEN, 180],
  [Color.RED, 160],
  [Color.BLUE, 120],
  [Color.CYAN, 80],
  [Color.MAGENTA, 60],
  [Color.GREEN, 20],
];

export const GEODE = new Geode(GEODE_BOUNDARY, STRIPES);
