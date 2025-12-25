import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { Grid } from "../../../sketchlib/Grid.js";
import { CirclePrimitive } from "../../../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { group, style } from "../../../sketchlib/primitives/shorthand.js";
import { Style } from "../../../sketchlib/Style.js";
import { Oklch } from "../../lablib/Oklch.js";

const FIRST_CENTER = new Point(0, 200);
const SPACING = new Direction(50, 50);
const MAX_RADIUS = 20;

const ANCHOR_POINT = new Point(0, 600);

const COLOR_POLYPS = new Oklch(0.5, 0.14, 27.53);
const STYLE_POLYPS = new Style({
  fill: COLOR_POLYPS.to_srgb(),
});

export class Polyps {
  constructor() {
    /**
     * @type {Grid<CirclePrimitive>}
     */
    this.circles = new Grid(10, 20);
    this.circles.fill(({ i, j }) => {
      const index = new Direction(j, i);
      const center = FIRST_CENTER.add(index.mul_components(SPACING));
      return new CirclePrimitive(center, MAX_RADIUS);
    });

    this.primitive = style(
      this.circles.map_array((_index, circle) => circle),
      STYLE_POLYPS
    );
  }

  update(time) {
    this.circles.for_each((index, circle) => {
      const { i, j } = index;
      const dist = circle.position.dist_sqr(ANCHOR_POINT);

      const wave = 0.5 + 0.5 * Math.sin(time - 0.2 * Math.sqrt(dist));
      circle.radius = wave * MAX_RADIUS;
    });
  }

  /**
   *
   * @returns {GroupPrimitive}
   */
  render() {
    return this.primitive;
  }
}
