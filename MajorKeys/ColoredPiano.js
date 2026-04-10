import { Direction } from "../sketchlib/pga2d/Direction.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
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
function make_black_keys(bounds) {
  const KEY_PROPORTION = new Direction(1 / 14, 9 / 16);
  const key_dimensions = bounds.dimensions.mul_components(KEY_PROPORTION);

  // key offsets in multiples of half the black key width, i.e. 1/28 of
  // the width of the keyboard
  const half_key_width = 0.5 * KEY_PROPORTION.x;
  const key_offsets = [3, 7, 15, 19, 23];
  return key_offsets.map((i) => {
    const offset = Direction.DIR_X.scale(i * half_key_width);
    return new RectPrimitive(bounds.position.add(offset), key_dimensions);
  });
}

/**
 * Single octave piano where each key can be
 * colored.
 */
export class ColoredPiano {
  /**
   *
   * @param {Rectangle} bounds
   * @param {Style[]} styles
   */
  constructor(bounds, styles) {}
}
