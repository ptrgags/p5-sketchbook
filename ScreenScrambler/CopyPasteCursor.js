import { Color } from "../sketchlib/Color.js";
import { Ease } from "../sketchlib/Ease.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Random } from "../sketchlib/random.js";
import { Style } from "../sketchlib/Style.js";
import { Tween } from "../sketchlib/Tween.js";

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

/**
 * An animated cursor that handles the logic of copying chunks of the screen
 * and later pasting them to a tilemap
 * @implements {Primitive}
 */
export class CopyPasteCursor {
  /**
   * Constructor
   * @param {Tilemap} tilemap_copy 1x1 tilemap that allows copying a single tile from the offscreen drawing
   * @param {Tilemap} tilemap_paste Full-canvas sized tilemap for pasting tiles. It must have the same tile size as tilemap_copy
   */
  constructor(tilemap_copy, tilemap_paste) {
    this.tilemap_copy = tilemap_copy;
    this.tilemap_paste = tilemap_paste;
    this.tile_size = tilemap_paste.tile_size;

    this.grid_dimensions = tilemap_paste.map_frames.grid_dimensions;

    this.state = CopyPasteState.MOVING_COPY;

    this.cursor = new Rect(Point.ORIGIN, this.tile_size);
    this.styled_cursor = style(this.cursor, STYLE_COPY);

    this.copy_index = this.rand_index();
    this.paste_index = new Index2D(0, 0);

    this.next_target = this.tile_size
      .mul_components(new Direction(this.copy_index.j, this.copy_index.i))
      .to_point();

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

  rand_index() {
    const { x: cols, y: rows } = this.grid_dimensions;
    const rand_row = Random.rand_int(0, rows);
    const rand_col = Random.rand_int(0, cols);
    return new Index2D(rand_row, rand_col);
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
    this.copy_index = this.rand_index();

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

    this.next_target = this.tile_size
      .mul_components(new Direction(index.j, index.i))
      .to_point();

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
