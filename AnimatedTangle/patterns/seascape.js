import { Direction } from "../../sketchlib/pga2d/Direction.js";
import { Point } from "../../sketchlib/pga2d/Point.js";
import { WIDTH } from "../../sketchlib/dimensions.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Transform } from "../../sketchlib/primitives/Transform.js";
import { Style } from "../../sketchlib/Style.js";
import {
  PALETTE_CORAL,
  PALETTE_NAVY,
  PALETTE_ROCK,
  PALETTE_SKY,
  Values,
} from "../theme_colors.js";
import { mod } from "../../sketchlib/mod.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { BeziergonPrimitive } from "../../sketchlib/primitives/BeziergonPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { Circle } from "../../sketchlib/primitives/Circle.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { Animated } from "../../sketchlib/animation/Animated.js";

const STYLE_MOUNTAINS = new Style({
  fill: PALETTE_ROCK[Values.MEDIUM],
});

const NUM_HILL_LAYERS = 3;
const MOUNTAIN_AMPLITUDE = 35;
const MOUNTAIN_CENTER = 35;

const HILL_FIRST_CENTER = 60;
const HILL_Y_SPACING = 10;
const HILL_AMPLITUDE = 20;
const HILL_STYLES = [
  new Style({
    fill: PALETTE_NAVY[Values.MED_LIGHT],
  }),
  new Style({
    fill: PALETTE_NAVY[Values.MEDIUM],
  }),
  new Style({
    fill: PALETTE_NAVY[Values.MED_DARK],
  }),
];

const DURATION_MOUNTAIN = 8;
const PARALLAX_STEP = 1.5;

const STYLE_SKY = new Style({
  fill: PALETTE_SKY[Values.MEDIUM],
});
const BACKGROUND = style(
  new RectPrimitive(Point.ORIGIN, new Direction(500, 100)),
  STYLE_SKY,
);

const SUN_CENTER = new Point(400, 25);
const SUN_RADIUS = 10;
const SUN_RAYS_INNER_RADIUS = 15;
const SUN_RAYS_OUTER_RADIUS = 20;

const SUN_RAY_LINES = Direction.roots_of_unity(12).map((dir) => {
  const start = SUN_CENTER.add(dir.scale(SUN_RAYS_INNER_RADIUS));
  const end = SUN_CENTER.add(dir.scale(SUN_RAYS_OUTER_RADIUS));
  return new LinePrimitive(start, end);
});

const STYLE_SUN_LINES = new Style({
  stroke: PALETTE_CORAL[Values.LIGHT],
});
const STYLE_SUN = new Style({
  fill: PALETTE_CORAL[Values.LIGHT],
});
const SUN_RAYS = style(SUN_RAY_LINES, STYLE_SUN_LINES);
const SUN_DISK = style(new Circle(SUN_CENTER, SUN_RADIUS), STYLE_SUN);
const SUN = group(SUN_DISK, SUN_RAYS);

const STYLE_SNOWCAPS = new Style({
  fill: PALETTE_SKY[Values.LIGHT],
});

// percentage of height from bottom to top
const SNOW_LEVEL = 0.6;

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

/**
 *
 * @param {Point[]} mountain_points Points from make_zigzag_points used for the mountain outline
 * @returns {GroupPrimitive} parallelogram snow caps created from the zigzag vertices. This is already styled
 */
function make_snowcaps(mountain_points) {
  // points are ordered down, up, down, up, down, up, and there are an odd
  // number of them so it always starts and ends on down
  //
  // we want to take every down, up, and down and make a quadrilateral like
  // the diagram
  //
  //      up
  //     /  \
  //    /\  /\
  //   /  \/  \
  //  /        \
  // down       down

  const snowcaps = [];
  for (let i = 0; i < mountain_points.length - 1; i += 2) {
    const down_left = mountain_points[i];
    const up = mountain_points[i + 1];
    const down_right = mountain_points[i + 2];

    const snow_left = Point.lerp(down_left, up, SNOW_LEVEL);
    const snow_right = Point.lerp(down_right, up, SNOW_LEVEL);

    // For the bottom point of the parallelogram
    const offset = snow_left.sub(up);
    const snow_down = snow_right.add(offset);

    snowcaps.push(
      new PolygonPrimitive([snow_left, snow_down, snow_right, up], true),
    );
  }
  return style(snowcaps, STYLE_SNOWCAPS);
}

/**
 * @implements {Animated}
 */
class Seascape {
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
      MOUNTAIN_CENTER,
    );

    this.hill_points = new Array(NUM_HILL_LAYERS);
    const num_hill_points = Math.floor(n / 2);
    for (let i = 0; i < NUM_HILL_LAYERS; i++) {
      const center_y = HILL_FIRST_CENTER + i * HILL_Y_SPACING;
      this.hill_points[i] = make_zigzag_points(
        num_hill_points,
        HILL_AMPLITUDE,
        center_y,
      );
    }

    const BOTTOM_RIGHT = new Point(500, 200);
    const BOTTOM_LEFT = new Point(0, 200);

    const mountain_poly = new PolygonPrimitive(
      [...this.mountain_points, BOTTOM_RIGHT, BOTTOM_LEFT],
      true,
    );
    const snowcaps = make_snowcaps(this.mountain_points);

    this.transform_orig = new Transform(new Direction(0, 0));
    this.transform_copy = new Transform(new Direction(-WIDTH, 0));
    const original = new GroupPrimitive([mountain_poly, snowcaps], {
      style: STYLE_MOUNTAINS,
      transform: this.transform_orig,
    });
    const copy = new GroupPrimitive([mountain_poly, snowcaps], {
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
        style: HILL_STYLES[i],
      });
      const copy = new GroupPrimitive(rolling_hills, {
        transform: transform_copy,
        style: HILL_STYLES[i],
      });
      primitives.push(original, copy);
    });

    this.primitive = group(BACKGROUND, SUN, ...primitives);
  }

  update(time) {
    const t_mountain = mod(time, DURATION_MOUNTAIN) / DURATION_MOUNTAIN;
    const mountain_offset = WIDTH * t_mountain;
    this.transform_orig.translation = new Direction(mountain_offset, 0);
    this.transform_copy.translation = new Direction(mountain_offset - WIDTH, 0);

    for (let i = 0; i < NUM_HILL_LAYERS; i++) {
      // Each layer is faster than the previous
      const duration_hill = DURATION_MOUNTAIN - PARALLAX_STEP * (i + 1);
      const phase = i / (NUM_HILL_LAYERS - 1);
      let t_hill = mod(time, duration_hill) / duration_hill;
      t_hill = mod(t_hill + phase, 1.0);
      const hill_offset = WIDTH * t_hill;
      this.hill_transforms_orig[i].translation = new Direction(hill_offset, 0);
      this.hill_transforms_copy[i].translation = new Direction(
        hill_offset - WIDTH,
        0,
      );
    }
  }
}

export const SEASCAPE = new Seascape(25);
