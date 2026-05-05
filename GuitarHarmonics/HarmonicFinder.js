import { WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";
import { Tween } from "../sketchlib/Tween.js";
import { GuitarDiagram, NECK_WIDTH, STRING_LENGTH } from "./GuitarDiagram.js";
import { harmonic_positions } from "./harmonic_positions.js";

const MAX_HARMONIC = 8;

const LINE_LENGTH_CURVE = Tween.scalar(150, 10, 2, MAX_HARMONIC - 2);

/**
 * @type {GroupPrimitive[]}
 */
const HARMONIC_LINES = [];

/**
 * @type {TextPrimitive[]}
 */
const LABELS = [];

for (let i = 2; i <= MAX_HARMONIC; i++) {
  const positions = harmonic_positions(i);
  const length = LINE_LENGTH_CURVE.get_value(i);

  const start_x = NECK_WIDTH;
  const end_x = start_x + length;

  const lines = positions.map((p) => {
    const y = p * STRING_LENGTH;
    return new LineSegment(new Point(start_x, y), new Point(end_x, y));
  });
  const line_style = new Style({
    stroke: Oklch.lerp(
      new Oklch(0.7, 0.1, 0),
      new Oklch(0.7, 0.1, 360),
      (i - 2) / (MAX_HARMONIC - 2),
    ),
    width: 2,
  });
  HARMONIC_LINES.push(style(lines, line_style));

  const labels = positions.map((p) => {
    return new TextPrimitive(`${i}`, new Point(end_x + 16, p * STRING_LENGTH));
  });
  LABELS.push(...labels);
}

const HARMONIC_LABELS = new GroupPrimitive(LABELS, {
  style: new Style({ fill: Oklch.grey(1.0) }),
  text_style: new TextStyle(16, "left", "center"),
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

    this.primitive = xform(
      [
        this.guitar.body,
        this.guitar.fret_numbers,
        ...HARMONIC_LINES,

        this.guitar.strings,
        HARMONIC_LABELS,
      ],
      TRANSLATE_CENTER,
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
