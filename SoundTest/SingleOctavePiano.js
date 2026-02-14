import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Color } from "../sketchlib/Color.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";

const NUM_WHITE_KEYS = 7;
const NUM_BLACK_KEYS = 5;

/**
 * Given a bounding rectangle, make 7 evenly-spaced rectangles for the
 * white keys
 * @param {Rectangle} bounding_rect Bounding rectangle for the whole piano octave
 * @return {RectPrimitive[]} An array of 7 rectangle primitives for the white keys
 */
function make_white_keys(bounding_rect) {
  const { x: width, y: height } = bounding_rect.dimensions;
  const key_dimensions = new Direction(width / 7, height);

  const result = new Array(7);

  for (let i = 0; i < NUM_WHITE_KEYS; i++) {
    const offset = Direction.DIR_X.scale(i * key_dimensions.x);
    result[i] = new RectPrimitive(
      bounding_rect.position.add(offset),
      key_dimensions,
    );
  }
  return result;
}

/**
 * Given the bounds for a piano octave, make 5 rectangles for the black keys.
 * @param {Rectangle} bounding_rect Bounding rectangle for the whole piano octave
 * @returns {RectPrimitive[]} An array of 5 rectangle primitives for the black keys, positioned at their respective spots over the white keys
 */
function make_black_keys(bounding_rect) {
  const { x: width, y: height } = bounding_rect.dimensions;
  const key_dimensions = new Direction(width / 14, (9 * height) / 16);

  // key offsets in multiples of half the black key width, i.e. 1/28 of
  // the width of the keyboard
  const key_offsets = [3, 7, 15, 19, 23];

  return key_offsets.map((i) => {
    const offset = Direction.DIR_X.scale((i * width) / 28);
    return new RectPrimitive(
      bounding_rect.position.add(offset),
      key_dimensions,
    );
  });
}

const WHITE = 0;
const BLACK = 1;

// Map of pitch: [0, 11] -> [key_color, index_within_color]
const KEY_MAPPING = [
  [WHITE, 0],
  [BLACK, 0],
  [WHITE, 1],
  [BLACK, 1],
  [WHITE, 2],
  [WHITE, 3],
  [BLACK, 2],
  [WHITE, 4],
  [BLACK, 3],
  [WHITE, 5],
  [BLACK, 4],
  [WHITE, 6],
];

const STYLE_WHITE_KEYS = new Style({
  stroke: Color.BLACK,
  fill: Color.WHITE,
});
const STYLE_BLACK_KEYS = new Style({
  fill: Color.BLACK,
});
const STYLE_HIGHLIGHT = new Style({
  fill: Color.CYAN,
});

/**
 * Single octave piano keyboard
 */
export class SingleOctavePiano {
  /**
   * Construct
   * @param {Rectangle} bounding_rect The bounding rectangle within which to draw the piano
   */
  constructor(bounding_rect) {
    const white_key_rects = make_white_keys(bounding_rect);
    const black_key_rects = make_black_keys(bounding_rect);

    const white_keys = style(white_key_rects, STYLE_WHITE_KEYS);
    const black_keys = style(black_key_rects, STYLE_BLACK_KEYS);

    this.white_highlights = new ShowHidePrimitive(
      white_key_rects,
      new Array(NUM_WHITE_KEYS).fill(false),
    );
    this.black_highlights = new ShowHidePrimitive(
      black_key_rects,
      new Array(NUM_BLACK_KEYS).fill(false),
    );

    this.primitive = group(
      white_keys,
      style(this.white_highlights, STYLE_HIGHLIGHT),
      black_keys,
      style(this.black_highlights, STYLE_HIGHLIGHT),
    );
  }

  /**
   * Set whether a key is pressed
   * @param {number} key_index key index in [0, 11]
   * @param {boolean} is_pressed If the key is pressed
   */
  set_key(key_index, is_pressed) {
    const [color, index] = KEY_MAPPING[key_index];
    const highlights =
      color === BLACK ? this.black_highlights : this.white_highlights;
    highlights.show_flags[index] = is_pressed;
  }

  /**
   * Release all keys
   */
  reset() {
    this.black_highlights.show_flags.fill(false);
    this.white_highlights.show_flags.fill(false);
  }
}
