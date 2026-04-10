import { Direction } from "../sketchlib/pga2d/Direction.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { Style } from "../sketchlib/Style.js";

// the larger keys (usually white)
const NUM_BIG_KEYS = 7;
const NUM_SMALL_KEYS = 5;

/**
 *
 * @param {Rectangle} bounds The bounding box
 * @returns {RectPrimitive[]} An array of 7 rectangle primitives
 */
function make_big_keys(bounds) {
  const { x: width, y: height } = bounds.dimensions;
  const key_dimensions = new Direction(width / 7, height);

  const result = new Array(NUM_BIG_KEYS);
  for (let i = 0; i < NUM_BIG_KEYS; i++) {
    const offset = Direction.DIR_X.scale(i * key_dimensions.x);
    result[i] = new RectPrimitive(bounds.position.add(offset), key_dimensions);
  }
  return result;
}

/**
 *
 * @param {Rectangle} bounds
 * @returns {RectPrimitive[]} An array of 5 thin rectangles within the bounding box
 */
function make_small_keys(bounds) {
  const KEY_PROPORTION = new Direction(1 / 14, 9 / 16);
  const key_dimensions = bounds.dimensions.mul_components(KEY_PROPORTION);

  // key offsets in multiples of half the black key width, i.e. 1/28 of
  // the width of the keyboard
  const half_key_width = 0.5 * key_dimensions.x;
  const key_offsets = [3, 7, 15, 19, 23];
  return key_offsets.map((i) => {
    const offset = Direction.DIR_X.scale(i * half_key_width);
    return new RectPrimitive(bounds.position.add(offset), key_dimensions);
  });
}

const RENDER_ORDER = [0, 2, 4, 5, 7, 9, 11, 1, 3, 6, 8, 10];

/**
 * Single octave piano where each key can be
 * colored.
 * @implements {Primitive}
 */
export class ColoredPiano {
  /**
   *
   * @param {Rectangle} bounds
   * @param {Style[]} styles Styles for each key in keyboard order
   */
  constructor(bounds, styles) {
    if (styles.length !== 12) {
      throw new Error("styles must have exactly 12 entries");
    }

    const [c, d, e, f, g, a, b] = make_big_keys(bounds);
    const [cs, ds, fs, gs, as] = make_small_keys(bounds);
    const keyboard_order = [c, cs, d, ds, e, f, fs, g, gs, a, as, b];

    /**
     * @type {GroupPrimitive[]}
     */
    this.styled_keys = keyboard_order.map((x, i) => style(x, styles[i]));
  }

  /**
   * Update the styles
   * @param {Style[]} styles
   */
  set_styles(styles) {
    if (styles.length !== 12) {
      throw new Error("styles must have exactly 12 entries");
    }

    styles.forEach((s, i) => {
      this.styled_keys[i].style = s;
    });
  }

  /**
   *
   * @param {import('p5')} p
   */
  draw(p) {
    for (const idx of RENDER_ORDER) {
      this.styled_keys[idx].draw(p);
    }
  }
}
