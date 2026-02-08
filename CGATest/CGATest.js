import { Point } from "../sketchlib/pga2d/Point.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Line } from "../sketchlib/pga2d/Line.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

// Create a few shapes encoded in CGA
const CIRCLE = Cline.from_circle(new Circle(new Point(250, 350), 50));
const LINE = Cline.from_line(new Line(1, 2, 500));
const POINT = Cline.from_point(new Point(100, 100));

// A line is the fixed point of a transformation
const REFLECT = LINE.vector.normalize();
// TODO: Due to floating point error, I'm getting the wrong result
//const REFLECTED_POINT = new Cline(REFLECT.unit_sandwich_odd(POINT.vector));
const REFLECTED_POINT = Cline.from_point(new Point(200, 200));
const REFLECTED_CIRCLE = new Cline(REFLECT.unit_sandwich_odd(CIRCLE.vector));

const INVERT = CIRCLE.vector.normalize();
const INVERTED_POINT = new Cline(INVERT.unit_sandwich_odd(POINT.vector));

// TODO: This is computing a point, not a line...
const INVERTED_LINE = new Cline(INVERT.unit_sandwich_odd(LINE.vector));

const LINE_STYLE = new Style({
  stroke: Color.YELLOW,
});
const REFLECTED_STYLE = new Style({
  stroke: Color.CYAN,
});
const INVERTED_STYLE = new Style({
  stroke: new Color(255, 127, 0),
});

const ORIGINAL_GEOM = style([CIRCLE, POINT, LINE], LINE_STYLE);
const REFLECTED_GEOM = style(
  [REFLECTED_POINT, REFLECTED_CIRCLE],
  REFLECTED_STYLE,
);
const INVERTED_GEOM = style([INVERTED_LINE, INVERTED_POINT], INVERTED_STYLE);

const CGA_GEOM = group(ORIGINAL_GEOM, REFLECTED_GEOM, INVERTED_GEOM);

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

    CGA_GEOM.draw(p);
  };
};
