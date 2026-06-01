import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { Rect } from "../sketchlib/primitives/Rect.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { SpeechBubblePrimitive } from "../sketchlib/primitives/SpeechBubblePrimitive.js";
import { Style } from "../sketchlib/Style.js";

const BUBBLE = new SpeechBubblePrimitive(
  Rect.from_center(SCREEN_CENTER, new Direction(150, 50)),
  new Direction(50, 50),
  new Point(150, 450),
  8,
);

const STRIDE = Direction.DIR_X.scale(50);

const ELLIPSIS_RADIUS = 10;
const ELLIPSIS = group(
  new Circle(SCREEN_CENTER.add(STRIDE.neg()), ELLIPSIS_RADIUS),
  new Circle(SCREEN_CENTER, ELLIPSIS_RADIUS),
  new Circle(SCREEN_CENTER.add(STRIDE), ELLIPSIS_RADIUS),
);

const STYLE_ELLIPSIS = new Style({
  fill: Color.BLACK,
});

const SCENE = group(BUBBLE, style(ELLIPSIS, STYLE_ELLIPSIS));

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

    SCENE.draw(p);
  };
};
