import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Ellipse } from "../sketchlib/primitives/Ellipse.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const BOUNDING_BOX = new RectPrimitive(
  new Point(100, 100),
  new Direction(200, 200),
);
const BUBBLE_RADII = BOUNDING_BOX.dimensions.mul_components(
  new Direction(0.5, 3 / 8),
);
const BUBBLE_CENTER = BOUNDING_BOX.position.add(BUBBLE_RADII);

const STYLE_BOUNDS = new Style({
  stroke: Color.RED,
});
const STYLE_OUTLINE = new Style({
  fill: Color.BLACK,
});
const STYLE_INTERIOR = new Style({
  fill: Color.WHITE,
});

const BUBBLE_OUTER = new Ellipse(BUBBLE_CENTER, BUBBLE_RADII);
const BUBBLE_INNER = new Ellipse(BUBBLE_CENTER, BUBBLE_RADII.scale(0.95));

// TODO: compute this relative to the bounding box
const TAIL_OUTER = new PolygonPrimitive(
  [new Point(100, 300), new Point(200, 150), new Point(150, 150)],
  true,
);
const TAIL_INNER = new PolygonPrimitive(
  [
    new Point(100 + 10, 300 - 20),
    new Point(200 - 5, 150 - 5),
    new Point(150 + 5, 150 + 5),
  ],
  true,
);

const ELLIPSIS_RADIUS = 10;
const ELLIPSIS = group(
  new Circle(new Point(150, 175), ELLIPSIS_RADIUS),
  new Circle(new Point(200, 175), ELLIPSIS_RADIUS),
  new Circle(new Point(250, 175), ELLIPSIS_RADIUS),
);

const SPEECH_BUBBLE = group(
  style(BOUNDING_BOX, STYLE_BOUNDS),
  style(BUBBLE_OUTER, STYLE_OUTLINE),
  style(TAIL_OUTER, STYLE_OUTLINE),
  style(BUBBLE_INNER, STYLE_INTERIOR),
  style(TAIL_INNER, STYLE_INTERIOR),
  style(ELLIPSIS, STYLE_OUTLINE),
);

// @ts-ignore
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
    p.background(128);

    SPEECH_BUBBLE.draw(p);
  };
};
