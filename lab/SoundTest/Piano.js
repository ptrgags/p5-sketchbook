import { Direction } from "../../pga2d/Direction.js";
import { Color } from "../../sketchlib/Color.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { MidiPitch } from "../lablib/music/pitch_conversions.js";
import { Rectangle } from "../lablib/Rectangle.js";

const NUM_WHITE_KEYS = 7;

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
      key_dimensions
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
      key_dimensions
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
  constructor(bounding_rect) {
    this.white_keys = make_white_keys(bounding_rect);
    this.black_keys = make_black_keys(bounding_rect);
    this.all_keys = [this.white_keys, this.black_keys];

    /**
     * Array of 12 booleans to determine which keys are pressed
     * @type {boolean[]}
     */
    this.is_pressed = new Array(12).fill(false);
  }

  /**
   * Set whether a key is pressed
   * @param {number} key_index key index in [0, 11]
   * @param {boolean} is_pressed If the key is pressed
   */
  set_key(key_index, is_pressed) {
    this.is_pressed[key_index] = is_pressed;
  }

  /**
   * Release all keys
   */
  reset() {
    this.is_pressed.fill(false);
  }

  /**
   * Get the active white keys and active black keys as separate arrays
   * for rendering. The result is returned as [active_white, active_black]
   * as these are rendered in two separate layers
   * @private
   * @type {RectPrimitive[][]}
   */
  get active_keys() {
    // [active_white, active_black]
    const result = [[], []];
    for (let i = 0; i < 12; i++) {
      if (!this.is_pressed[i]) {
        continue;
      }

      const [color, index] = KEY_MAPPING[i];
      result[color].push(this.all_keys[color][index]);
    }

    return result;
  }

  render() {
    const white_keys = style(this.white_keys, STYLE_WHITE_KEYS);
    const black_keys = style(this.black_keys, STYLE_BLACK_KEYS);

    const [active_white, active_black] = this.active_keys;
    const white_highlights = style(active_white, STYLE_HIGHLIGHT);
    const black_highlights = style(active_black, STYLE_HIGHLIGHT);

    return group(white_keys, white_highlights, black_keys, black_highlights);
  }
}

/**
 * Multiple-octave piano visualization. The size and number of octaves is
 * configurable.
 */
export class Piano {
  /**
   * Constructor
   * @param {Rectangle} bounding_rect Bounding rectangle for the whole keyboard
   * @param {number} octave_start Octave number of the leftmost (lowest) octave
   * @param {number} num_octaves How many octaves to fit in the bounding box
   */
  constructor(bounding_rect, octave_start, num_octaves) {
    /**
     * Key press counter for each pitch. On a key press, the counter goes
     * up, on a release, the counter goes down.
     * @type {number[]}
     */
    this.key_presses = new Array(128).fill(0);

    this.octave_start = octave_start;
    this.num_octaves = num_octaves;

    const { x: width, y: height } = bounding_rect.dimensions;
    const octave_width = width / num_octaves;
    const octave_dimensions = new Direction(octave_width, height);

    // Create a number of single-octave pianos
    this.octave_pianos = new Array(this.num_octaves);
    for (let i = 0; i < num_octaves; i++) {
      const offset = bounding_rect.position.add(
        Direction.DIR_X.scale(i * octave_width)
      );
      this.octave_pianos[i] = new SingleOctavePiano(
        new Rectangle(offset, octave_dimensions)
      );
    }
  }

  /**
   * Trigger the specified key of the keyboard. Out of range values will be
   * ignored.
   * Duplicate key presses are tracked with a counter so to reset a key,
   * you need to call release() the same number of times as trigger()
   * @param {number} midi_note MIDI pitch number in [0, 127]
   */
  trigger(midi_note) {
    const octave = MidiPitch.get_octave(midi_note);
    if (
      octave < this.octave_start ||
      octave >= this.octave_start + this.num_octaves
    ) {
      console.warn("Triggering out-of-range note", octave);
      return;
    }

    // Increment the counter
    this.key_presses[midi_note]++;

    const pitch = MidiPitch.get_pitch_class(midi_note);
    this.octave_pianos[octave - this.octave_start].set_key(pitch, true);
  }

  /**
   * Release the specified key of the keyboard. Out-of range values will be
   * ignored
   * @param {number} midi_note MIDI pitch number in [0, 127]
   */
  release(midi_note) {
    const octave = MidiPitch.get_octave(midi_note);
    if (
      octave < this.octave_start ||
      octave >= this.octave_start + this.num_octaves
    ) {
      console.warn("Releasing out-of-range note", midi_note);
      return;
    }

    // Decrement the counter
    this.key_presses[midi_note]--;

    if (this.key_presses[midi_note] < 0) {
      console.warn("more releases than triggers for note", midi_note);
    }

    if (this.key_presses[midi_note] <= 0) {
      // Only release the note if duplicates have been resolved
      const pitch = MidiPitch.get_pitch_class(midi_note);
      this.octave_pianos[octave - this.octave_start].set_key(pitch, false);
    }
  }

  reset() {
    this.key_presses.fill(0);
    this.octave_pianos.forEach((x) => x.reset());
  }

  render() {
    const octave_primitives = this.octave_pianos.map((x) => x.render());
    return group(...octave_primitives);
  }
}
