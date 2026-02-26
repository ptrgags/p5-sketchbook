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

// Create a few shapes encoded in CGA
const CIRCLE = Cline.from_circle(new Circle(new Point(250, 350), 50));
const LINE = Cline.from_line(new Line(3 / 5, 4 / 5, 350));
const POINT = NullPoint.from_point(new Point(250, 450));

// A line is the fixed point of a transformation
const REFLECT = LINE.vector.normalize();
const REFLECTED_POINT = POINT.transform(REFLECT);
const REFLECTED_CIRCLE = CIRCLE.transform(REFLECT);

const INVERT = CIRCLE.vector.normalize_o();
const INVERTED_POINT = POINT.transform(INVERT);
const INVERTED_LINE = LINE.transform(INVERT);

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

const ORIGINAL_GEOM = style([CIRCLE, POINT, LINE], LINE_STYLE);
const REFLECTED_GEOM = style(
  [REFLECTED_POINT, REFLECTED_CIRCLE],
  REFLECTED_STYLE,
);
const INVERTED_GEOM = style([INVERTED_LINE, INVERTED_POINT], INVERTED_STYLE);

const CGA_GEOM = group(ORIGINAL_GEOM, REFLECTED_GEOM, INVERTED_GEOM);

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const BIG_UNIT_CIRCLE = TO_SCREEN.transform_cline(Cline.UNIT_CIRCLE);

const N = 40;
const POINTS = [
  new Point(-0.8, 0.2),
  new Point(-0.8, 0.0),
  new Point(-0.8, -0.2),
].map((x) => NullPoint.from_point(x));

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
    /*
    const rotation = CVersor.rotation(angle);
    const rotate_center = TRANSLATE_CENTER.conjugate(rotation);
    const spinning_line = rotate_center.transform_cline(LINE);
    const spinning_circle = rotate_center.transform_cline(INVERTED_LINE);
    const spinning_point = rotate_center.transform_point(POINT);*/

    const elliptic = CVersor.elliptic(Direction.DIR_Y, angle);
    const elliptic_screen = TO_SCREEN.compose(elliptic);
    const swirled_points = POINTS.map((x) =>
      elliptic_screen.transform_point(x),
    );

    const min_factor = 1 / 100;
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

    const styled = style(
      [BIG_UNIT_CIRCLE, /*...swirled_points, ...hyp_points,*/ ...lox_points],
      SPIN_STYLE,
    );
    const styled2 = style([...swirled_points, ...hyp_points], INVERTED_STYLE);

    CGA_GEOM.draw(p);
    styled.draw(p);
    styled2.draw(p);
  };
};
