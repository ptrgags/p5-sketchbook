import { RingBuffer } from "../../lab/lablib/RingBuffer.js";
import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH } from "../../sketchlib/dimensions.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { group, style, xform } from "../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../sketchlib/primitives/Transform.js";
import { Style } from "../../sketchlib/Style.js";

const STYLE_MOUNTAINS = new Style({
  fill: Color.from_hex_code("#555555"),
});

class Landscape {
  constructor(n) {
    /**
     * @type {Point[]}
     */
    this.mountain_points = [];

    const spacing = WIDTH / (n - 1);
    const center_y = 50;

    for (let i = 0; i < n; i++) {
      const sign = (-1) ** i;
      const height = 40 * Math.random();

      this.mountain_points.push(
        new Point(i * spacing, center_y + sign * height)
      );
    }
    // Make it loop
    const last_point = this.mountain_points[this.mountain_points.length - 1];
    this.mountain_points[0] = new Point(
      this.mountain_points[0].x,
      last_point.y
    );

    const mountain_poly = new PolygonPrimitive(
      [...this.mountain_points, new Point(500, 100), new Point(0, 100)],
      false
    );
    const grey_mountains = style(mountain_poly, STYLE_MOUNTAINS);

    this.transform_orig = new Transform(new Direction(0, 0));
    this.transform_copy = new Transform(new Direction(-WIDTH, 0));
    const original = xform([grey_mountains], this.transform_orig);
    const copy = xform([grey_mountains], this.transform_copy);

    this.primitive = group(original, copy);
  }

  update(t) {
    const offset = WIDTH * t;
    this.transform_orig.translation = new Direction(offset, 0);
    this.transform_copy.translation = new Direction(offset - WIDTH, 0);
  }

  render() {
    return this.primitive;
  }
}

export const LANDSCAPE = new Landscape(25);
