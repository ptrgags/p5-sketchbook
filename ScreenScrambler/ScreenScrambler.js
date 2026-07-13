import { Clock } from "../sketchlib/animation/Clock.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_DIMENSIONS } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Drawing } from "../sketchlib/pixel/Drawing.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Random } from "../sketchlib/random.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { CopyPasteCursor } from "./CopyPasteCursor.js";
import { FlyingShape } from "./FlyingShape.js";

const NUM_SHAPES = 20;
const MAX_RADIUS = 100;
const SHAPES = range(NUM_SHAPES)
  .map((i) => {
    const rand_x = Random.rand_int(0, WIDTH);
    const rand_y = Random.rand_int(0, HEIGHT);
    const start_point = new Direction(rand_x, rand_y);
    const rand_radius = Random.rand_int(16, MAX_RADIUS);
    const rand_angle = Random.rand_range(0, 2.0 * Math.PI);
    const rand_speed = Random.rand_range(20, 100);
    const start_velocity = Direction.from_angle(rand_angle).scale(rand_speed);

    const hue = (i * 360) / NUM_SHAPES;
    const circle_style = new Style({
      stroke: Color.WHITE,
      fill: new Oklch(0.7, 0.1, hue),
      width: 2,
    });

    return new FlyingShape(
      style(new Circle(Point.ORIGIN, rand_radius), circle_style),
      start_point,
      start_velocity,
      MAX_RADIUS,
    );
  })
  .toArray();

const CLOCK = new Clock();

const TILE_SIZE = new Direction(25, 25);
const GRID_SIZE = SCREEN_DIMENSIONS.div_components(TILE_SIZE);

// These will be updated in setup() as some primitives need p5 resources
const SCENE_OFFSCREEN = group(...SHAPES);
const SCENE_SCREEN = group(SCENE_OFFSCREEN);
const SCENE_TILES_ONLY = group();

// @ts-ignore
export const sketch = (p) => {
  /**
   * @type {Drawing | undefined}
   */
  let drawing_offscreen;
  let tilemap_copy;
  let tilemap_paste;
  /**
   * @type {CopyPasteCursor | undefined}
   */
  let cursor;

  let show_tiles_only = false;

  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );

    const checkbox = document.getElementById("tiles-only");
    checkbox?.addEventListener("change", (e) => {
      // @ts-ignore
      show_tiles_only = e.target?.checked;

      if (cursor) {
        // when in pasted tiles mode only, speed up the animation so it's more
        // bearable to watch
        const DEFAULT_CURSOR_SPEED = 1.0;
        cursor.duration_move = show_tiles_only
          ? 0.25 * DEFAULT_CURSOR_SPEED
          : DEFAULT_CURSOR_SPEED;
      }
    });

    p.pixelDensity(1);

    const gfx_offscreen = p.createGraphics(WIDTH, HEIGHT);
    drawing_offscreen = new Drawing(gfx_offscreen, Point.ORIGIN);
    tilemap_copy = new Tilemap(
      p,
      gfx_offscreen,
      TILE_SIZE,
      new Direction(1, 1),
      Point.ORIGIN,
    );
    tilemap_paste = new Tilemap(
      p,
      tilemap_copy.map_gfx,
      TILE_SIZE,
      GRID_SIZE,
      Point.ORIGIN,
    );

    cursor = new CopyPasteCursor(tilemap_copy, tilemap_paste);

    // set up a feedback loop - pasting to the screen impacts future copy
    // operations!
    SCENE_OFFSCREEN.regroup(tilemap_paste, ...SHAPES);
    SCENE_SCREEN.regroup(SCENE_OFFSCREEN, cursor);
    SCENE_TILES_ONLY.regroup(tilemap_paste);
  };

  p.draw = () => {
    p.background(0);

    const time = CLOCK.elapsed_time;
    for (const shape of SHAPES) {
      shape.update(time);
    }

    drawing_offscreen?.clear();
    drawing_offscreen?.p5_gfx.background(0);
    drawing_offscreen?.draw_primitive(SCENE_OFFSCREEN);

    cursor?.update(time);

    if (show_tiles_only) {
      SCENE_TILES_ONLY.draw(p);
    } else {
      SCENE_SCREEN.draw(p);
    }
  };
};
