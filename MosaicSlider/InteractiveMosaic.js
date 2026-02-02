import { Point } from "../sketchlib/pga2d/Point.js";
import { Color } from "../sketchlib/Color.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { MosaicGrid } from "./MosaicGrid.js";

const SliderState = {
  IDLE: 0,
  SELECTING: 1,
  ANIMATING: 2,
};

/**
 * This is the main class for managing the interactive mosaic. It owns the
 * MosaicGrid and any PixelSwapPair animations.
 *
 * This class acts as a finite state machine for handling mouse interaction,
 * as there are only a few states.
 */
export class InteractiveMosaic {
  /**
   * Constructor
   * @param {Color[]} colors An array of 4 colors to apply to the four quadrants of the mosaic grid
   */
  constructor(colors) {
    this.grid = new MosaicGrid(colors);
    this.state = SliderState.IDLE;

    this.src_index = undefined;
    this.dst_index = undefined;

    this.frame = 0;

    this.swap_pair = undefined;
    this.mouse = new Point(0, 0);
    this.mouse_down = false;
  }

  /**
   * Handle a mouse press event. This may advance the state machine
   * @param {Point} mouse The current position of the mouse
   */
  mouse_press(mouse) {
    this.mouse = mouse;
    this.mouse_down = true;

    if (this.state !== SliderState.IDLE) {
      return;
    }

    const src_index = this.grid.compute_index(mouse);
    if (src_index) {
      this.src_index = src_index;
      this.state = SliderState.SELECTING;
    }
  }

  /**
   * Handle a mouse drag event. This may advance the state machine.
   * @param {Point} mouse The current mouse position
   */
  mouse_drag(mouse) {
    this.mouse = mouse;
    this.mouse_down = true;

    if (this.state !== SliderState.SELECTING) {
      return;
    }

    this.dst_index = this.grid.compute_neighbor(this.src_index, mouse);

    // If the mouse moved to one of the selected cell's neighbors, start
    // the swapping animation
    if (this.dst_index) {
      this.swap_pair = this.grid.pop_out_pair(
        this.src_index,
        this.dst_index,
        this.frame,
      );
      this.state = SliderState.ANIMATING;
    }
  }

  /**
   * Handle a mouse release event. This may advance the state machine.
   */
  mouse_release() {
    this.mouse = this.mouse;
    this.mouse_down = false;

    if (this.state === SliderState.SELECTING) {
      this.state = SliderState.IDLE;
    }
  }

  /**
   * @private
   */
  done_animation() {
    this.grid.pop_in_swapped_pair();
    this.swap_pair = undefined;
    if (this.mouse_down) {
      this.state = SliderState.SELECTING;
      this.src_index = this.dst_index;
      this.dst_index = undefined;
      // Simulate a mouse drag to keep the animation going.
      this.mouse_drag(this.mouse);
    } else {
      this.state = SliderState.IDLE;
      this.src_index = undefined;
      this.dst_index = undefined;
    }
  }

  /**
   * Update one of the grid colors
   * @param {number} index The integer index of the color in [0, 4)
   * @param {Color} color The new color
   */
  update_color(index, color) {
    this.grid.update_color(index, color);

    // I'm not going to bother with updating any slider animation in progress,
    // it's such a short animation.
  }

  /**
   * Update the mosaic animation
   * @param {number} frame The current frame number
   */
  update(frame) {
    this.frame = frame;

    if (this.swap_pair && this.swap_pair.is_done(frame)) {
      this.done_animation();
    }

    this.grid.update();
  }

  /**
   * Render the mosaic and possibly the swapped pixel animation
   * @param {number} frame the current frame number
   * @returns {GroupPrimitive} All the primitives to draw this frame.
   */
  render(frame) {
    const grid = this.grid.render();

    if (this.swap_pair) {
      return group(grid, this.swap_pair.render(frame));
    }
    return grid;
  }

  /**
   * Get the colors from the underlying MosaicGrid
   * @returns {Color[]} A flat array of the colors in the grid
   */
  get_colors() {
    return this.grid.get_colors();
  }
}
