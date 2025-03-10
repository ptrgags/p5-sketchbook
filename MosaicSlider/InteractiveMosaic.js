import { Point } from "../pga2d/objects.js";

import { Index2D } from "../sketchlib/Grid.js";
import { in_bounds } from "../sketchlib/in_bounds.js";
import { GroupPrimitive } from "../sketchlib/primitives.js";
import { Color } from "../sketchlib/Style.js";
import { MosaicGrid } from "./MosaicGrid.js";
import { PixelSwapPair } from "./PixelSwapPair.js";
import { sec_to_frames } from "./Tween.js";

const SliderState = {
  IDLE: 0,
  SELECTING: 1,
  ANIMATING: 2,
};

export class InteractiveMosaic {
  constructor(colors) {
    this.grid = new MosaicGrid(colors);
    this.state = SliderState.IDLE;

    this.src_index = undefined;
    this.dst_index = undefined;

    this.frame = 0;

    this.swap_pair = undefined;
    this.mouse = Point.point(0, 0);
    this.mouse_down = false;
  }

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
        this.frame
      );
      this.state = SliderState.ANIMATING;
    }
  }

  mouse_release() {
    this.mouse = this.mouse;
    this.mouse_down = false;

    if (this.state === SliderState.SELECTING) {
      this.state = SliderState.IDLE;
    }
  }

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
      return new GroupPrimitive([grid, this.swap_pair.render(frame)]);
    }
    return grid;
  }
}
