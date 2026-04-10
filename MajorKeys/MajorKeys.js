import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { griderator } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { group, xform } from "../sketchlib/primitives/shorthand.js";
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
 * @type {ColoredPiano[]}
 */
const PIANOS = [];
griderator(6, 2, (row, col) => {
  const start_note = col * 6 + row;
  const transposed_styles = cycle_right(STYLES, start_note);

  const rect = new Rectangle(
    Point.ORIGIN.add(STRIDE.mul_components(new Direction(col, row))),
    KEYBOARD_DIMS,
  );

  const piano = new ColoredPiano(rect, transposed_styles);

  PIANOS.push(piano);
});

// hacky way to get two octaves: take the pianos and add a translated copy
const SHIFT_OCTAVE = new Transform(Direction.DIR_X.scale(KEYBOARD_DIMS.x));
const SCENE = group(...PIANOS, xform(PIANOS, SHIFT_OCTAVE));

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
