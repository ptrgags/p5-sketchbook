import { Clock } from "../sketchlib/animation/Clock.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_DIMENSIONS } from "../sketchlib/dimensions.js";
import { Ease } from "../sketchlib/Ease.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Drawing } from "../sketchlib/pixel/Drawing.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Random } from "../sketchlib/random.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { Tween } from "../sketchlib/Tween.js";
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

const TILE_SIZE = new Direction(50, 50);
const GRID_SIZE = SCREEN_DIMENSIONS.div_components(TILE_SIZE);

// These will be updated in setup() as some primitives need p5 resources
const SCENE_OFFSCREEN = group(...SHAPES);
const SCENE_SCREEN = group(SCENE_OFFSCREEN);
const SCENE_TILES_ONLY = group();

function rand_index() {
  const rand_row = Random.rand_int(0, 7);
  const rand_col = Random.rand_int(0, 5);
  return new Index2D(rand_row, rand_col);
}

/**
 * @enum {number}
 */
const CopyPasteState = {
  MOVING_COPY: 0,
  COPY: 1,
  MOVING_PASTE: 2,
  PASTE: 3,
};

const STYLE_COPY = Style.lines(Color.YELLOW, 4);
const STYLE_PASTE = Style.lines(Color.BLUE, 4);

class CopyPaste {
  /**
   *
   * @param {Tilemap} tilemap_copy
   * @param {Tilemap} tilemap_paste
   */
  constructor(tilemap_copy, tilemap_paste) {
    this.tilemap_copy = tilemap_copy;
    this.tilemap_paste = tilemap_paste;

    this.grid_dimensions = tilemap_paste.map_frames.grid_dimensions;

    this.state = CopyPasteState.MOVING_COPY;

    this.cursor = new Rect(Point.ORIGIN, TILE_SIZE);
    this.styled_cursor = style(this.cursor, STYLE_COPY);

    this.copy_index = rand_index();
    this.paste_index = new Index2D(0, 0);

    this.next_target = TILE_SIZE.mul_components(
      new Direction(this.copy_index.j, this.copy_index.i),
    ).to_point();

    this.duration_move = 1.0;

    this.tween = Tween.point(
      this.cursor.position,
      this.next_target,
      0,
      this.duration_move,
      Ease.in_out_cubic,
    );

    this.show_copy_buffer = new ShowHidePrimitive([this.tilemap_copy], [false]);
    this.primitive = group(this.styled_cursor, this.show_copy_buffer);
  }

  /**
   *
   * @param {number} time
   * @returns
   */
  move(time) {
    const position = this.tween.get_value(time);
    const is_done = this.tween.is_done(time);

    if (is_done && this.state === CopyPasteState.MOVING_COPY) {
      this.state = CopyPasteState.COPY;
      return;
    } else if (is_done && this.state === CopyPasteState.MOVING_PASTE) {
      this.state = CopyPasteState.PASTE;
      return;
    }

    this.cursor.position = position;
    this.tilemap_copy.position = position;
  }

  /**
   *
   * @param {number} time
   */
  copy(time) {
    const columns = this.grid_dimensions.x;
    const { i, j } = this.copy_index;
    const idx = i * columns + j;
    this.tilemap_copy.blit_tile(new Index2D(0, 0), idx);
    this.show_copy_buffer.show_flags = [true];

    // Select the next copy location
    this.copy_index = rand_index();

    this.choose_next_target(time, this.paste_index);
    this.styled_cursor.style = STYLE_PASTE;
    this.state = CopyPasteState.MOVING_PASTE;
  }

  /**
   *
   * @param {number} time
   */
  paste(time) {
    this.tilemap_paste.blit_tile(this.paste_index, 0);
    this.show_copy_buffer.show_flags = [false];

    // increment the paste index
    const { x: cols, y: rows } = this.grid_dimensions;
    const paste_1d = this.paste_index.i * cols + this.paste_index.j;
    const next_paste_1d = (paste_1d + 1) % (rows * cols);
    const row = Math.floor(next_paste_1d / cols);
    const col = next_paste_1d % cols;
    this.paste_index = new Index2D(row, col);

    this.choose_next_target(time, this.copy_index);
    this.styled_cursor.style = STYLE_COPY;
    this.state = CopyPasteState.MOVING_COPY;
  }

  /**
   *
   * @param {number} time
   * @param {Index2D} index of the next target in the grid
   */
  choose_next_target(time, index) {
    const position = this.next_target;
    this.cursor.position = position;

    this.next_target = TILE_SIZE.mul_components(
      new Direction(index.j, index.i),
    ).to_point();

    this.tween = Tween.point(
      position,
      this.next_target,
      time,
      this.duration_move,
      Ease.in_out_cubic,
    );
  }

  /**
   *
   * @param {number} time
   */
  update(time) {
    switch (this.state) {
      case CopyPasteState.MOVING_COPY:
        this.move(time);
        return;
      case CopyPasteState.COPY:
        this.copy(time);
        return;
      case CopyPasteState.MOVING_PASTE:
        this.move(time);
        return;
      case CopyPasteState.PASTE:
        this.paste(time);
        return;
    }
  }

  draw(p) {
    this.primitive.draw(p);
  }
}

// @ts-ignore
export const sketch = (p) => {
  /**
   * @type {Drawing | undefined}
   */
  let drawing_offscreen;
  let tilemap_copy;
  let tilemap_paste;
  /**
   * @type {CopyPaste | undefined}
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

    cursor = new CopyPaste(tilemap_copy, tilemap_paste);

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
