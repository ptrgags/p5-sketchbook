import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { griderator } from "../sketchlib/Grid.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import {
  A,
  Ab,
  AS,
  B,
  Bb,
  C,
  D,
  Db,
  DS,
  E,
  Eb,
  F,
  FS,
  G,
} from "../sketchlib/music/pitches.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group, xform } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { Style } from "../sketchlib/Style.js";
import { ColoredPiano } from "./ColoredPiano.js";

const STYLE_ROOT = new Style({
  stroke: Color.BLACK,
  fill: Color.RED,
});

const STYLE_WHITE_KEYS = new Style({
  stroke: Color.BLACK,
  fill: Color.WHITE,
});
const STYLE_BLACK_KEYS = new Style({
  fill: Color.BLACK,
  stroke: Color.WHITE,
});

const STYLES = [
  STYLE_ROOT,
  STYLE_BLACK_KEYS,
  STYLE_WHITE_KEYS,
  STYLE_BLACK_KEYS,
  STYLE_WHITE_KEYS,
  STYLE_WHITE_KEYS,
  STYLE_BLACK_KEYS,
  STYLE_WHITE_KEYS,
  STYLE_BLACK_KEYS,
  STYLE_WHITE_KEYS,
  STYLE_BLACK_KEYS,
  STYLE_WHITE_KEYS,
];

const ROWS = 6;
const COLS = 2;

const STRIDE = new Direction(WIDTH / COLS, HEIGHT / ROWS);
const KEYBOARD_DIMS = new Direction(
  (0.45 * WIDTH) / COLS,
  (0.75 * HEIGHT) / ROWS,
);

/**
 * @template T
 * @param {Array<T>} arr
 * @param {number} places
 * @returns {Array<T>} Array of the same length, cycled the given number of places to the right
 */
function cycle_right(arr, places) {
  const result = new Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    result[(i + places) % arr.length] = arr[i];
  }
  return result;
}

/**
 * @type {TextPrimitive[]}
 */
const LABELS = [];

/**
 * @type {ColoredPiano[]}
 */
const PIANOS = [];

// Order the pianos in a circle of fourths progression. Though the layout
// is in two columns so it's a rather squashed circle.
const START_NOTES = [
  [C, G],
  [F, D],
  [Bb, A],
  [Eb, E],
  [Ab, B],
  [Db, FS],
];
const NOTE_LABELS = [
  ["C", "G"],
  ["F", "D"],
  ["B♭", "A"],
  ["E♭", "E"],
  ["A♭", "B"],
  ["D♭", "G♭/F♯"],
];

griderator(6, 2, (row, col) => {
  const start_note = START_NOTES[row][col];
  const transposed_styles = cycle_right(STYLES, start_note);

  const KEYBOARD_ORIGIN = Point.ORIGIN.add(
    STRIDE.mul_components(new Direction(col, row)),
  );

  const rect = new Rectangle(KEYBOARD_ORIGIN, KEYBOARD_DIMS);

  const piano = new ColoredPiano(rect, transposed_styles);

  const key_label = NOTE_LABELS[row][col];
  const label = new TextPrimitive(
    `${key_label} Major`,
    KEYBOARD_ORIGIN.add(KEYBOARD_DIMS),
  );
  LABELS.push(label);

  PIANOS.push(piano);
});

// hacky way to get two octaves: take the pianos and add a translated copy
const SHIFT_OCTAVE = new Transform(Direction.DIR_X.scale(KEYBOARD_DIMS.x));
const SCENE = group(
  ...PIANOS,
  xform(PIANOS, SHIFT_OCTAVE),
  new GroupPrimitive(LABELS, {
    text_style: new TextStyle(24, "center", "top"),
    style: new Style({
      fill: Color.BLACK,
    }),
  }),
);

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
    p.background(127);
    SCENE.draw(p);

    p.noLoop();
  };
};
