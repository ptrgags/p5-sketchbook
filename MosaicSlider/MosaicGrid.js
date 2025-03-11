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
const SWAP_DURATION = sec_to_frames(1 / 16);
const PIXEL_STYLE = new Style().with_stroke(Color.BLACK).with_width(2);

/**
 * Color each quadrant of the grid a different color
 * @param {Index2D} index The index of the pixel
 * @returns {number} The color index into the array of styles
 */
function get_quadrant_color(index) {
  const { i, j } = index;
  // go from pixels to a 2x2 grid of quadrants
  const half_rows = ROWS / 2;
  const half_cols = COLS / 2;
  const big_row = Math.floor(i / half_rows);
  const big_col = Math.floor(j / half_cols);

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
      return get_quadrant_color(index);
    });

    this.colors = colors;
    this.styles = colors.map((x) => PIXEL_STYLE.with_fill(x));
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

  /**
   * If the mouse clicked a cell and then dragged to one of the four neighboring
   * cells, return the index of the neighbor. Otherwise return undefined
   * @param {Index2D} src_index
   * @param {Point} mouse The current mouse position
   * @returns {Index2D|undefined} The neighbor index, if it exists
   */
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

  /**
   * Look up which of the four styles to use for this pixel.
   * @param {Index2D} index The index of the pixel to get the style for
   * @returns {Style} the style for the selected pixels
   */
  get_style(index) {
    const color_index = this.grid.get(index);
    return this.styles[color_index];
  }

  /**
   * Create the primitive. Call this only when the grid state changes.
   * @private
   * @returns {GroupPrimitive} The rendering primitive for the current state of the grid.
   */
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

  /**
   * Given two neighboring grid cells, create a swap pair animation
   * @private
   * @param {Index2D} src_index Source cell
   * @param {Index2D} dst_index Destination cell
   * @param {number} start_frame The frame number for the start of the animation
   * @returns {PixelSwapPair} The swap pair animation
   */
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

  /**
   * Update a single color for styling
   * @param {number} index The index in [0, 4)
   * @param {Color} color The new color
   */
  update_color(index, color) {
    this.colors[index] = color;
    this.styles[index] = PIXEL_STYLE.with_fill(color);
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

  /**
   * Get the colors currently visible in the grid for exporting an image.
   * If a swap animation is
   * in progress, the colors before the swap are returned.
   * @returns {Color[]} A flat array of the colors in the grid.
   */
  get_colors() {
    return this.grid.map_array((index, color_index) => {
      // If
      if (index === this.src_index) {
        color_index = this.src_index;
      } else if (index === this.dst_index) {
        color_index = this.dst_index;
      }

      return this.colors[color_index];
    });
  }

  /**
   * Call this once a frame.
   */
  update() {
    if (this.primitive_dirty) {
      this.primitive = this.create_primitive();
      this.primitive_dirty = false;
    }
  }

  /**
   * The primitives to render
   * @returns {GroupPrimitive} The primitive to render
   */
  render() {
    return this.primitive;
  }
}
