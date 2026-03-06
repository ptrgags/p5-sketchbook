import { Animated } from "../sketchlib/animation/Animated.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { DashedPath } from "./DashedPath.js";

const STYLE_PIPE_WALLS = new Style({
  stroke: Color.from_hex_code("#666666"),
  width: 12,
});
const STYLE_PIPE_INTERIOR = new Style({
  stroke: Color.from_hex_code("#111111"),
  width: 8,
});

// TODO: These might be backwards...
const ANGLES_QUADRANT4 = new ArcAngles(0, Math.PI / 2);
const ANGLES_QUADRANT3 = new ArcAngles(Math.PI / 2, Math.PI);
const ANGLES_QUADRANT2 = new ArcAngles(Math.PI, (3 * Math.PI) / 2);
const ANGLES_QUADRANT1 = new ArcAngles((3 * Math.PI) / 2, 2 * Math.PI);
const BEND_RADIUS = 25;
const PIPE_SEGMENTS_BASS = [
  new LinePrimitive(new Point(100, 0), new Point(100, 75)),
  new ArcPrimitive(new Point(125, 75), BEND_RADIUS, ANGLES_QUADRANT3),
  new LinePrimitive(new Point(125, 100), new Point(150, 100)),
  new ArcPrimitive(new Point(150, 125), BEND_RADIUS, ANGLES_QUADRANT1),
  new LinePrimitive(new Point(175, 125), new Point(175, 150)),
  new ArcPrimitive(new Point(150, 150), BEND_RADIUS, ANGLES_QUADRANT4),
  new LinePrimitive(new Point(125, 175), new Point(150, 175)),
  new ArcPrimitive(new Point(125, 200), BEND_RADIUS, ANGLES_QUADRANT2),
  new LinePrimitive(new Point(100, 200), new Point(100, 250)),
];

const PIPE_WALLS = style(PIPE_SEGMENTS_BASS, STYLE_PIPE_WALLS);
const PIPE_INTERIOR = style(PIPE_SEGMENTS_BASS, STYLE_PIPE_INTERIOR);
const PIPES = group(PIPE_WALLS, PIPE_INTERIOR);

const STYLE_DASHES = new Style({
  stroke: Color.RED,
  width: 8,
});

/**
 * @implements {Animated}
 */
export class NotePipes {
  constructor() {
    this.bass_dashes = new DashedPath(PIPE_SEGMENTS_BASS);

    this.primitive = group(
      PIPES,
      style(this.bass_dashes.primitive, STYLE_DASHES),
    );
  }

  update(time) {
    const velocity = 20;
    const dashes = [
      [0, 100],
      [125, 200],
      [225, 275],
      [300, 400],
    ].map((x) => [x[0] + velocity * time, x[1] + velocity * time]);
    this.bass_dashes.update_dashes(dashes);
  }
}
