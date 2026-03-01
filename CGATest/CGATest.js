import { Point } from "../sketchlib/pga2d/Point.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Line } from "../sketchlib/pga2d/Line.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { range } from "../sketchlib/range.js";
import { mod } from "../sketchlib/mod.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { ClineArc } from "../sketchlib/cga2d/ClineArc.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";

// Create a few shapes encoded in CGA
const CIRCLE = Cline.from_circle(new Circle(new Point(250, 350), 50));
const LINE = Cline.from_line(new Line(3 / 5, 4 / 5, 350));
const POINT = NullPoint.from_point(new Point(350, 250));
const CHIP = [
  ClineArc.from_segment(
    new LinePrimitive(new Point(10, 10), new Point(10, 110)),
  ),
  ClineArc.from_segment(
    new LinePrimitive(new Point(10, 110), new Point(110, 110)),
  ),
  ClineArc.from_arc(
    new ArcPrimitive(new Point(10, 110), 100, new ArcAngles(0, Math.PI / 2)),
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
const SPIN_STYLE = new Style({
  stroke: new Color(0, 255, 127),
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

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT - 200),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const BIG_UNIT_CIRCLE = TO_SCREEN.transform_cline(Cline.UNIT_CIRCLE);

const POINTS = [
  new Point(-0.8, 0.2),
  new Point(-0.8, 0.0),
  new Point(-0.8, -0.2),
].map((x) => NullPoint.from_point(x));

const N = 40;
const POINTS2 = [...range(N)].map((x) => {
  const point = Point.lerp(new Point(0, -0.8), new Point(0, 0.8), x / (N - 1));
  return NullPoint.from_point(point);
});

const MAX_EXPONENT = 15;
const PARABOLIC_STEP = new Direction(1, 0);
const PARABOLIC_TILES = [...range(2 * MAX_EXPONENT + 1)].map((x) => {
  const power = x - MAX_EXPONENT;
  const offset = PARABOLIC_STEP.scale(power);
  const parabolic = CVersor.parabolic(offset);
  return parabolic.transform_cline(Cline.Y_AXIS);
});

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

    const t = p.frameCount / 500;
    const f = 3;
    const angle = 2.0 * Math.PI * f * t;

    const elliptic = CVersor.elliptic(Direction.DIR_Y, angle);
    const elliptic_screen = TO_SCREEN.compose(elliptic);
    const swirled_points = POINTS.map((x) =>
      elliptic_screen.transform_point(x),
    );

    const min_factor = 1;
    const max_factor = 100;
    const factor_t = 0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI);
    const factor =
      Math.pow(min_factor, 1.0 - factor_t) * Math.pow(max_factor, factor_t);
    const hyperbolic = CVersor.hyperbolic(Direction.DIR_X, factor);
    const hyp_screen = TO_SCREEN.compose(hyperbolic);
    const hyp_points = POINTS.map((x) => hyp_screen.transform_point(x));

    const lox = elliptic.compose(hyperbolic);
    const lox_screen = TO_SCREEN.compose(lox);
    const lox_points = POINTS.map((x) => lox_screen.transform_point(x));

    const parabolic = CVersor.parabolic(new Direction(100.0 * t - 100, 0));
    const para_screen = TO_SCREEN.compose(parabolic);
    const para_points = POINTS2.map((x) => para_screen.transform_point(x));

    const para_tiles = PARABOLIC_TILES.map((x) => TO_SCREEN.transform_cline(x));

    // Give the illusion of translating forever by drawing a whole bunch of tiles
    const t_repeat = mod(2 * t, 1.0);
    const para_illusion = CVersor.parabolic(PARABOLIC_STEP.scale(t_repeat));
    const para_ill_screen = TO_SCREEN.compose(para_illusion);
    const para_ill_tiles = PARABOLIC_TILES.map((x) =>
      para_ill_screen.transform_cline(x),
    );

    const styled = style(
      [BIG_UNIT_CIRCLE, ...lox_points, ...para_points],
      SPIN_STYLE,
    );
    const styled2 = style(
      [...swirled_points, ...hyp_points, ...para_ill_tiles],
      INVERTED_STYLE,
    );

    CGA_GEOM.draw(p);
    styled.draw(p);
    styled2.draw(p);
  };
};
