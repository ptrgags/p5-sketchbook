import { Direction } from "../../../pga2d/Direction.js";
import { Point } from "../../../pga2d/Point.js";
import { WIDTH } from "../../../sketchlib/dimensions.js";
import { PolygonPrimitive } from "../../../sketchlib/primitives/PolygonPrimitive.js";
import { group } from "../../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../../sketchlib/primitives/Transform.js";
import { Style } from "../../../sketchlib/Style.js";
import { PALETTE_ROCK, Values } from "../theme_colors.js";
import { mod } from "../../../sketchlib/mod.js";
import { GroupPrimitive } from "../../../sketchlib/primitives/GroupPrimitive.js";
import { BeziergonPrimitive } from "../../../sketchlib/primitives/BeziergonPrimitive.js";

const STYLE_MOUNTAINS = new Style({
  fill: PALETTE_ROCK[Values.MedDark].to_srgb(),
});

const NUM_HILL_LAYERS = 3;
const MOUNTAIN_AMPLITUDE = 35;
const MOUNTAIN_CENTER = 35;

/**
 *
 * @param {number} n How many points to make across the width of the screen
 * @param {number} amplitude the amplitude of the wave in pixels
 * @param {number} center_y the center y value in pixels
 */
function make_zigzag_points(n, amplitude, center_y) {
  const spacing = WIDTH / (n - 1);

  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    const sign = (-1) ** i;
    const height = amplitude * Math.random();

    result[i] = new Point(i * spacing, center_y + sign * height);
  }
  // Make it loop
  const last_point = result.at(-1);
  result[0] = new Point(result[0].x, last_point.y);

  return result;
}

class Landscape {
  /**
   * Constructor
   * @param {number} n number of points across the screen for the mountains
   */
  constructor(n) {
    /**
     * @type {Point[]}
     */
    this.mountain_points = make_zigzag_points(
      n,
      MOUNTAIN_AMPLITUDE,
      MOUNTAIN_CENTER
    );

    this.hill_points = new Array(NUM_HILL_LAYERS);
    const num_hill_points = Math.floor(n / 2);
    for (let i = 0; i < NUM_HILL_LAYERS; i++) {
      const amplitude = 10;
      const center_y = (i + 1) * 25;
      this.hill_points[i] = make_zigzag_points(
        num_hill_points,
        amplitude,
        center_y
      );
    }

    const BOTTOM_RIGHT = new Point(500, 200);
    const BOTTOM_LEFT = new Point(0, 200);

    const mountain_poly = new PolygonPrimitive(
      [...this.mountain_points, BOTTOM_RIGHT, BOTTOM_LEFT],
      true
    );
    this.transform_orig = new Transform(new Direction(0, 0));
    this.transform_copy = new Transform(new Direction(-WIDTH, 0));
    const original = new GroupPrimitive(mountain_poly, {
      style: STYLE_MOUNTAINS,
      transform: this.transform_orig,
    });
    const copy = new GroupPrimitive(mountain_poly, {
      style: STYLE_MOUNTAINS,
      transform: this.transform_copy,
    });
    const primitives = [original, copy];

    // References to the transforms for animation
    this.hill_transforms_orig = new Array(NUM_HILL_LAYERS);
    this.hill_transforms_copy = new Array(NUM_HILL_LAYERS);
    this.hills = this.hill_points.map((point_array, i) => {
      const points = [...point_array, BOTTOM_RIGHT, BOTTOM_LEFT];
      const rolling_hills = BeziergonPrimitive.interpolate_points(points);

      const transform_orig = new Transform(new Direction(0, 0));
      const transform_copy = new Transform(new Direction(-WIDTH, 0));

      this.hill_transforms_orig[i] = transform_orig;
      this.hill_transforms_copy[i] = transform_copy;

      const original = new GroupPrimitive(rolling_hills, {
        transform: transform_orig,
      });
      const copy = new GroupPrimitive(rolling_hills, {
        transform: transform_copy,
      });
      primitives.push(original, copy);
    });

    this.primitive = group(...primitives);
  }

  update(time) {
    const DURATION_MOUNTAIN = 8;
    const t_mountain = mod(time, DURATION_MOUNTAIN) / DURATION_MOUNTAIN;
    const mountain_offset = WIDTH * t_mountain;
    this.transform_orig.translation = new Direction(mountain_offset, 0);
    this.transform_copy.translation = new Direction(mountain_offset - WIDTH, 0);

    for (let i = 0; i < NUM_HILL_LAYERS; i++) {
      // Each layer is faster than the previous
      const duration_hill = DURATION_MOUNTAIN - 2 * i;
      const t_hill = mod(time, duration_hill) / duration_hill;
      const hill_offset = WIDTH * t_hill;
      this.hill_transforms_orig[i].translation = new Direction(hill_offset, 0);
      this.hill_transforms_copy[i].translation = new Direction(
        hill_offset - WIDTH,
        0
      );
    }
  }

  render() {
    return this.primitive;
  }
}

export const LANDSCAPE = new Landscape(25);
