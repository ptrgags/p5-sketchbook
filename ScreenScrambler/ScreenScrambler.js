import { Clock } from "../sketchlib/animation/Clock.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Drawing } from "../sketchlib/pixel/Drawing.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Random } from "../sketchlib/random.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { FlyingShape } from "./FlyingShape.js";

const SHAPES = range(20)
  .map(() => {
    const rand_x = Random.rand_int(0, WIDTH);
    const rand_y = Random.rand_int(0, HEIGHT);
    const start_point = new Direction(rand_x, rand_y);
    const rand_radius = Random.rand_int(16, 100);
    const rand_angle = Random.rand_range(0, 2.0 * Math.PI);
    const rand_speed = Random.rand_range(20, 100);
    const start_velocity = Direction.from_angle(rand_angle).scale(rand_speed);

    const rand_hue = Random.rand_range(0, 360);
    const circle_style = new Style({
      stroke: Color.WHITE,
      fill: new Oklch(0.7, 0.1, rand_hue),
      width: 2,
    });

    return new FlyingShape(
      style(new Circle(Point.ORIGIN, rand_radius), circle_style),
      start_point,
      start_velocity,
    );
  })
  .toArray();

const CLOCK = new Clock();

const TILE_SIZE = new Direction(100, 100);

const SCENE_OFFSCREEN = group(...SHAPES);

const CURSOR = new Rect(Point.ORIGIN, TILE_SIZE);
const STYLED_CURSOR = style(CURSOR, Style.lines(Color.YELLOW, 4));

// will be populated
const SCENE_SCREEN = group(SCENE_OFFSCREEN, STYLED_CURSOR);

// @ts-ignore
export const sketch = (p) => {
  let drawing_offscreen;
  let tilemap_copy;
  let tilemap_paste;

  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );

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
      gfx_offscreen,
      TILE_SIZE,
      new Direction(5, 7),
      Point.ORIGIN,
    );

    // set up a feedback loop - pasting to the screen impacts future copy
    // operations!
    SCENE_OFFSCREEN.regroup(tilemap_paste, ...SHAPES);
    SCENE_SCREEN.regroup(SCENE_OFFSCREEN, STYLED_CURSOR, tilemap_copy);
  };

  p.draw = () => {
    p.background(0);

    SCENE_SCREEN.draw(p);

    const time = CLOCK.elapsed_time;
    for (const shape of SHAPES) {
      shape.update(time);
    }
  };
};
