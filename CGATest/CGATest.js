import { Point } from "../pga2d/Point.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { CirclePrimitive } from "../sketchlib/primitives/CirclePrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const CIRCLE = Cline.from_circle(new CirclePrimitive(new Point(250, 350), 50));
const POINT = Cline.from_point(new Point(100, 100));

const LINE_STYLE = new Style({
  fill: Color.RED,
  stroke: Color.WHITE,
});
const POINT_STYLE = new Style({
  fill: Color.BLUE,
});

const CGA_GEOM = group(style(CIRCLE, LINE_STYLE), style(POINT, POINT_STYLE));

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
