import { WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { GuitarDiagram, NECK_WIDTH, STRING_LENGTH } from "./GuitarDiagram.js";
import { harmonic_positions } from "./harmonic_positions.js";

const STYLE_HARMONIC_LINES = new Style({
  stroke: new Oklch(0.7, 0.1, 210),
});

const MAX_HARMONIC = 200;
const HARMONIC_LINES = range(MAX_HARMONIC).map((i) => {
  const width = (2 * WIDTH) / (i + 1);
  const lines = harmonic_positions(i + 1).map(
    (p) =>
      new LineSegment(
        new Point(NECK_WIDTH, p * STRING_LENGTH),
        new Point(NECK_WIDTH + width, p * STRING_LENGTH),
      ),
  );

  return style(lines, STYLE_HARMONIC_LINES);
});

/**
 * @implements {Primitive}
 */
export class InfiniteHarmonics {
  constructor() {
    this.guitar = new GuitarDiagram();
    this.primitive = group(
      this.guitar.body,

      ...HARMONIC_LINES,
      this.guitar.strings,
    );
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}
