import { WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { GuitarDiagram, NECK_WIDTH, STRING_LENGTH } from "./GuitarDiagram.js";
import { harmonic_positions } from "./harmonic_positions.js";

const MAX_HARMONIC = 8;
const HARMONIC_LINES = range(MAX_HARMONIC).map((i) => {
  const width = (2 * WIDTH) / (i + 1);
  const lines = harmonic_positions(i + 1).map(
    (p) =>
      new LineSegment(
        new Point(NECK_WIDTH, p * STRING_LENGTH),
        new Point(NECK_WIDTH + width, p * STRING_LENGTH),
      ),
  );
  const line_style = new Style({
    stroke: Oklch.lerp(
      new Oklch(0.7, 0.1, 0),
      new Oklch(0.7, 0.1, 360),
      i / (MAX_HARMONIC - 1),
    ),
    width: 2,
  });

  return style(lines, line_style);
});

// Move the fretboard and strings so its center
const TRANSLATE_CENTER = new Transform(
  new Direction(WIDTH / 2 - NECK_WIDTH / 2, 0),
);

/**
 * @implements {Primitive}
 */
export class HarmonicFinder {
  constructor() {
    this.guitar = new GuitarDiagram();

    this.primitive = group(
      xform(this.guitar.body, TRANSLATE_CENTER),
      ...HARMONIC_LINES,
      xform(this.guitar.strings, TRANSLATE_CENTER),
    );
  }

  draw(p) {
    this.primitive.draw(p);
  }
}
