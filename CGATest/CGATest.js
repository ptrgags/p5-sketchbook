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

const TRANSLATE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);

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
    const rotation = CVersor.rotation(t * 2.0 * Math.PI);
    const rotate_center = TRANSLATE_CENTER.conjugate(rotation);
    const spinning_line = rotate_center.transform_cline(LINE);
    const spinning_circle = rotate_center.transform_cline(INVERTED_LINE);
    const spinning_point = rotate_center.transform_point(POINT);
    const styled = style(
      [spinning_line, spinning_circle, spinning_point],
      SPIN_STYLE,
    );

    CGA_GEOM.draw(p);

    styled.draw(p);
  };
};
