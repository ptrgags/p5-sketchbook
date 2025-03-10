import { Point } from "../pga2d/objects.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { GroupPrimitive, RectPrimitive } from "../sketchlib/primitives.js";
import { Color, Style } from "../sketchlib/Style.js";
import { PixelSwapPair } from "./PixelSwapPair.js";
import { in_bounds } from "../sketchlib/in_bounds.js";
import { sec_to_frames } from "./Tween.js";

const ROWS = 16;
const COLS = 16;
const SQUARE_SIZE = 30;
const MARGIN_X = (WIDTH - COLS * SQUARE_SIZE) / 2;
const MARGIN_Y = (HEIGHT - ROWS * SQUARE_SIZE) / 2;
const STRIDE = Point.direction(SQUARE_SIZE, SQUARE_SIZE);
const CORNER = Point.point(MARGIN_X, MARGIN_Y);
const SWAP_DURATION = sec_to_frames(0.125);

function select_color(index) {
  const { i, j } = index;
  // go from
  const half_rows = ROWS / 2;
  const half_cols = COLS / 2;
  const big_row = Math.floor(i / half_rows);
  const big_col = Math.floor(j / half_rows);

  return (big_row << 1) | big_col;
}

export class MosaicGrid {
  /**
   * Constructor
   * @param {Color[]} colors 4 colors for the pixels. These will correspond to the 4 quadrants of the 16x16 grid
   */
  constructor(colors) {
    this.colors = colors;
    this.grid = new Grid(ROWS, COLS);
    this.grid.fill((index) => {
      return select_color(index);
    });

    this.colors = colors;
    this.styles = colors.map((x) =>
      new Style().with_fill(x).with_stroke(Color.BLACK)
    );
    // Add an additional style for hole pixels.
    this.styles.push(new Style());

    this.primitive = this.create_primitive();
    this.primitive_dirty = false;

    this.src_index = undefined;
    this.dst_index = undefined;
    this.src_pixel = undefined;
    this.dst_pixel = undefined;
  }

  /**
   * Compute which cell the mouse is over
   * @param {Point} mouse The mouse position
   * @returns {Index2D|undefined} The index of the cell the mouse is over, or undefined if the mouse was not hovering over the grid
   */
  compute_index(mouse) {
    const { x, y } = mouse;
    const j = Math.floor((x - MARGIN_X) / SQUARE_SIZE);
    const i = Math.floor((y - MARGIN_Y) / SQUARE_SIZE);
    if (!in_bounds(i, j, COLS, ROWS)) {
      return undefined;
    }

    return new Index2D(i, j);
  }

  compute_neighbor(src_index, mouse) {
    // If the mouse didn't leave the cell, we can ignore the mouse event.
    const { x, y } = mouse;
    const mi = Math.floor((y - MARGIN_Y) / SQUARE_SIZE);
    const mj = Math.floor((x - MARGIN_X) / SQUARE_SIZE);
    const { i, j } = src_index;
    if (i === mi && j === mj) {
      return undefined;
    }

    // Look at the vector between the cell's center and the mouse.
    // Pick the closest cardinal direction and move one cell in that direction.
    const src_center = Point.point(
      MARGIN_X + (j + 0.5) * SQUARE_SIZE,
      MARGIN_Y + (i + 0.5) * SQUARE_SIZE
    );
    const to_mouse = mouse.sub(src_center);

    const abs_x = Math.abs(to_mouse.x);
    const abs_y = Math.abs(to_mouse.y);
    const is_horizontal = abs_x > abs_y;

    if (is_horizontal && to_mouse.x > 0) {
      return this.grid.right(src_index);
    } else if (is_horizontal) {
      return src_index.left();
    } else if (!is_horizontal && to_mouse.y > 0) {
      return this.grid.down(src_index);
    }

    return src_index.up();
  }

  get_style(index) {
    const color_index = this.grid.get(index);
    return this.styles[color_index];
  }

  create_primitive() {
    const by_colors = [[], [], [], [], []];
    this.grid.for_each((index, color_index) => {
      if (color_index === undefined) {
        return;
      }

      const { i, j } = index;
      const offset = Point.direction(j * SQUARE_SIZE, i * SQUARE_SIZE);
      const position = CORNER.add(offset);
      const rect = new RectPrimitive(position, STRIDE);
      by_colors[color_index].push(rect);
    });
    const color_groups = by_colors.map((x, i) => {
      return new GroupPrimitive(x, this.styles[i]);
    });
    return new GroupPrimitive(color_groups);
  }

  compute_swap_pair(src_index, dst_index, start_frame) {
    const { i: src_i, j: src_j } = src_index;
    const { i: dst_i, j: dst_j } = dst_index;
    const position_a = CORNER.add(
      Point.direction(src_j * SQUARE_SIZE, src_i * SQUARE_SIZE)
    );
    const style_a = this.get_style(src_index);
    const position_b = CORNER.add(
      Point.direction(dst_j * SQUARE_SIZE, dst_i * SQUARE_SIZE)
    );
    const style_b = this.get_style(dst_index);
    return new PixelSwapPair(
      style_a,
      position_a,
      style_b,
      position_b,
      start_frame,
      SWAP_DURATION,
      SQUARE_SIZE
    );
  }

  /**
   * Pop out a pair of adjacent pixels from the grid, creating a swap
   * animation. The two cells are replaced by undefined values
   * @param {Index2D} src_index The source index
   * @param {Index2D} dst_index The destination index
   * @param {number} frame The frame number for initializing the animation
   * @returns {PixelSwapPair} the animated pair of pixels that will be swapped
   */
  pop_out_pair(src_index, dst_index, frame) {
    if (src_index.direction_to(dst_index) === undefined) {
      throw new Error("indices must be neighbors!");
    }

    // Create the swap pair before we start removing the pixels from the grid.
    const swap_pair = this.compute_swap_pair(src_index, dst_index, frame);

    this.src_index = src_index;
    this.dst_index = dst_index;
    this.src_pixel = this.grid.get(src_index);
    this.dst_pixel = this.grid.get(dst_index);

    // Replace the pixel with an undefined
    this.grid.set(src_index, undefined);
    this.grid.set(dst_index, undefined);

    this.primitive_dirty = true;

    return swap_pair;
  }

  update_color(index, color) {
    this.colors[index] = color;
    this.styles[index] = new Style().with_fill(color).with_stroke(Color.BLACK);
    this.primitive_dirty = true;
  }

  pop_in_swapped_pair() {
    this.grid.set(this.dst_index, this.src_pixel);
    this.grid.set(this.src_index, this.dst_pixel);

    this.src_index = undefined;
    this.dst_index = undefined;
    this.src_pixel = undefined;
    this.dst_pixel = undefined;

    this.primitive_dirty = true;
  }

  get_colors() {
    return this.grid.map_array((index, color_index) => {
      if (index === this.src_index) {
        color_index = this.src_index;
      } else if (index === this.dst_index) {
        color_index = this.dst_index;
      }

      return this.colors[color_index];
    });
  }

  update() {
    if (this.primitive_dirty) {
      this.primitive = this.create_primitive();
      this.primitive_dirty = false;
    }
  }

  render() {
    return this.primitive;
  }
}
