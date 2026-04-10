import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { griderator } from "../sketchlib/Grid.js";
import { mod } from "../sketchlib/mod.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { Rectangle } from "../sketchlib/Rectangle.js";
import { Style } from "../sketchlib/Style.js";
import { ColoredPiano } from "./ColoredPiano.js";

const STYLE_WHITE_KEYS = new Style({
  stroke: Color.BLACK,
  fill: Color.WHITE,
});
const STYLE_BLACK_KEYS = new Style({
  fill: Color.BLACK,
});

const STYLES = [
  STYLE_WHITE_KEYS,
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
const KEYBOARD_DIMS = new Direction(WIDTH / COLS, (0.75 * HEIGHT) / ROWS);

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

  const rect = new Rectangle(
    Point.ORIGIN.add(STRIDE.mul_components(new Direction(col, row))),
    KEYBOARD_DIMS,
  );

  const piano = new ColoredPiano(rect, cycle_right(STYLES, start_note));
  PIANOS.push(piano);
});

const SCENE = group(...PIANOS);

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
  };

  p.draw = () => {
    p.background(0);
    SCENE.draw(p);
  };
};
