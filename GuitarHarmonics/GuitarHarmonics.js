import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { range } from "../sketchlib/range.js";
import { Rational } from "../sketchlib/Rational.js";
import { Style } from "../sketchlib/Style.js";

const STYLE_FRETBOARD = new Style({
  // brown
  fill: new Oklch(0.3576, 0.0675, 65.7),
});

const STYLE_FRETS = new Style({
  stroke: Oklch.grey(0.25),
});

const STYLE_STRINGS = new Style({
  stroke: Oklch.grey(0.5),
  width: 2,
});

/**
 * Compute the fret position
 * @param {number} n Integer fret number
 * @returns {number} The fraction along the length of the string measured from the top
 */
function fret_position(n) {
  return 1 - 2 ** (-n / 12);
}

/**
 * Compute the positions where the nth harmonic
 * will be heard
 * @param {number} n
 * @returns {number[]}
 */
function harmonic_positions(n) {
  const result = [];
  for (let i = 0; i <= n; i++) {
    const fraction = new Rational(i, n);
    // If the fraction was not in lowest terms,
    // skip it as a lower harmonic will be heard instead.
    if (fraction.denominator !== n) {
      continue;
    }
    result.push(fraction.real);
  }
  return result;
}

const STRING_LENGTH = HEIGHT;
const NECK_WIDTH = 100;
const FRETBOARD_LENGTH = fret_position(24) * STRING_LENGTH;

const FRETBOARD = new RectPrimitive(
  Point.ORIGIN,
  new Direction(NECK_WIDTH, FRETBOARD_LENGTH),
);

const FRETS = range(24 + 1)
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

const MAX_HARMONIC = 100;
const HARMONIC_LINES = range(MAX_HARMONIC).map((i) => {
  const width = (2 * WIDTH) / (i + 1);
  const lines = harmonic_positions(i + 1).map(
    (p) =>
      new LineSegment(
        new Point(NECK_WIDTH, p * STRING_LENGTH),
        new Point(NECK_WIDTH + width, p * STRING_LENGTH),
      ),
  );
  return style(
    lines,
    new Style({
      stroke: Oklch.lerp(
        new Oklch(0.7, 0.1, 0),
        new Oklch(0.7, 0.1, 360),
        i / (MAX_HARMONIC - 1),
      ),
      width: 2,
    }),
  );
});

const SCENE = group(
  style(FRETBOARD, STYLE_FRETBOARD),
  style(FRETS, STYLE_FRETS),
  style(STRINGS, STYLE_STRINGS),
  ...HARMONIC_LINES,
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
  };

  p.draw = () => {
    p.background(0);
    SCENE.draw(p);
  };
};
