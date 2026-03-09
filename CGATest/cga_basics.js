import { StaticAnimation } from "../sketchlib/animation/Animated.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { Color } from "../sketchlib/Color.js";
import { Line } from "../sketchlib/pga2d/Line.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

// Create a few shapes encoded in CGA
const CIRCLE = Cline.from_circle(new Circle(new Point(250, 350), 50));
const LINE = Cline.from_line(new Line(3 / 5, 4 / 5, 350));
const POINT = NullPoint.from_point(new Point(350, 250));
const CHIP = [
  ClineArc.from_segment(new LineSegment(new Point(10, 10), new Point(10, 110))),
  ClineArc.from_segment(
    new LineSegment(new Point(10, 110), new Point(110, 110)),
  ),
  ClineArc.from_arc(
    new ArcPrimitive(new Point(10, 110), 100, new ArcAngles(0, -Math.PI / 2)),
  ),
];

// A line is the fixed point of a transformation
const REFLECT = LINE.vector.normalize();
const REFLECTED_POINT = POINT.transform(REFLECT);
const REFLECTED_CIRCLE = CIRCLE.transform(REFLECT);
const REFLECTED_CHIP = CHIP.map((x) => x.transform(REFLECT));

const INVERT = CIRCLE.vector.normalize_o();
const INVERTED_POINT = POINT.transform(INVERT);
const INVERTED_LINE = LINE.transform(INVERT);
const INVERTED_CHIP = CHIP.map((x) => x.transform(INVERT));

const LINE_STYLE = new Style({
  stroke: Color.YELLOW,
});
const REFLECTED_STYLE = new Style({
  stroke: Color.CYAN,
});
const INVERTED_STYLE = new Style({
  stroke: new Color(255, 127, 0),
});

const ORIGINAL_GEOM = style([CIRCLE, POINT, LINE, ...CHIP], LINE_STYLE);
const REFLECTED_GEOM = style(
  [REFLECTED_POINT, REFLECTED_CIRCLE, ...REFLECTED_CHIP],
  REFLECTED_STYLE,
);
const INVERTED_GEOM = style(
  [INVERTED_LINE, INVERTED_POINT, ...INVERTED_CHIP],
  INVERTED_STYLE,
);

const CGA_GEOM = group(ORIGINAL_GEOM, REFLECTED_GEOM, INVERTED_GEOM);

export const CGA_BASICS = new StaticAnimation(CGA_GEOM);
