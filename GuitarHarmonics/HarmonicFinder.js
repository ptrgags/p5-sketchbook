import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { range } from "../sketchlib/range.js";

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

/**
 * @implements {Primitive}
 */
export class HarmonicFinder {
  draw(p) {
    throw new Error("Method not implemented.");
  }
}
