import { HEIGHT } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";

export const STRING_LENGTH = HEIGHT;
export const NECK_WIDTH = 100;
export const FRETBOARD_LENGTH = fret_position(24) * STRING_LENGTH;

/**
 * Compute the fret position
 * @param {number} n Fret number. It can be a decimal value to locate spots between frets
 * @returns {number} The fraction along the length of the string measured from the top
 */
function fret_position(n) {
  return 1 - 2 ** (-n / 12);
}

const FRETBOARD = new Rect(
  Point.ORIGIN,
  new Direction(NECK_WIDTH, FRETBOARD_LENGTH),
);

// 0th fret + 24 frets
const NUM_FRETS = 24 + 1;

const FRETS = range(NUM_FRETS)
  .map((i) => {
    const y = fret_position(i) * STRING_LENGTH;
    return new LineSegment(new Point(0, y), new Point(NECK_WIDTH, y));
  })
  .toArray();

const STRING_POSITIONS = [1 / 8, 3 / 8, 5 / 8, 7 / 8];

const STRINGS = STRING_POSITIONS.map((p) => {
  return new LineSegment(
    new Point(p * NECK_WIDTH, 0),
    new Point(p * NECK_WIDTH, STRING_LENGTH),
  );
});

const STYLE_FRETBOARD = new Style({
  // brown
  fill: new Oklch(0.3576, 0.0675, 65.7),
});

const STYLE_FRETS = new Style({
  stroke: Oklch.grey(0.75),
});

const STYLE_STRINGS = new Style({
  stroke: Oklch.grey(0.5),
  width: 2,
});

const DOT_RADIUS = 4;
const STYLE_DOTS = new Style({
  fill: new Oklch(0.7, 0.1, 50),
});

const STYLE_NUMBERS = new Style({
  fill: Oklch.grey(1.0),
});
const TEXT_STYLE_FRETS = new TextStyle(14, "right", "top");

const NUMBERS = range(NUM_FRETS)
  .map((i) => {
    return new TextPrimitive(
      `${i}`,
      new Point(-2, fret_position(i) * STRING_LENGTH),
    );
  })
  .toArray();

const FRET_NUMBERS = new GroupPrimitive(NUMBERS, {
  style: STYLE_NUMBERS,
  text_style: TEXT_STYLE_FRETS,
});

/**
 * Pairs of (x_percent, fret_number)
 * @type {[number, number][]}
 */
const DOT_POSITIONS = [
  // Single dot at frets 3, 5, 7, 9
  [1 / 2, 2.5],
  [1 / 2, 4.5],
  [1 / 2, 6.5],
  [1 / 2, 8.5],
  // Double dot at fret 12
  [1 / 4, 11.5],
  [3 / 4, 11.5],
  // single dots at frets 15, 17, 19, 21
  [1 / 2, 14.5],
  [1 / 2, 16.5],
  [1 / 2, 18.5],
  [1 / 2, 20.5],
  // double dots at fret 24
  [1 / 4, 23.5],
  [3 / 4, 23.5],
];

const DOTS = DOT_POSITIONS.map(([x_percent, fret]) => {
  return new Circle(
    new Point(NECK_WIDTH * x_percent, fret_position(fret) * STRING_LENGTH),
    DOT_RADIUS,
  );
});

export class GuitarDiagram {
  constructor() {
    this.body = group(
      style(FRETBOARD, STYLE_FRETBOARD),
      style(FRETS, STYLE_FRETS),
      style(DOTS, STYLE_DOTS),
    );
    this.fret_numbers = FRET_NUMBERS;

    this.strings = style(STRINGS, STYLE_STRINGS);
  }
}
