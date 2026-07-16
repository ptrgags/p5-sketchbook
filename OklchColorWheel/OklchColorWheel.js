import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { range } from "../sketchlib/range.js";
import { Style } from "../sketchlib/Style.js";

const TEXT_STYLE_CENTERED = new TextStyle(24, "center", "center");

const N = 24;
const DEGREE_STEP = 360 / N;
const RADIAN_STEP = -(2 * Math.PI) / N;

const HUE_ANGLES = range(N)
  .map((i) => i * DEGREE_STEP)
  .toArray();

const TEXT = HUE_ANGLES.map((hue_angle, i) => {
  const theta = i * RADIAN_STEP;

  return new TextPrimitive(
    hue_angle.toString(),
    SCREEN_CENTER.add(Direction.from_angle(theta).scale(200)),
  );
});

const CIRCLE_RADIUS = 24;
const CIRCLES = HUE_ANGLES.map((hue_angle, i) => {
  const theta = i * RADIAN_STEP;
  const center = SCREEN_CENTER.add(Direction.from_angle(theta).scale(200));
  const circle = new Circle(center, CIRCLE_RADIUS);
  const style_circle = Style.flat(new Oklch(0.7, 0.1, hue_angle));
  return style(circle, style_circle);
});

const CIRCLE5_RADIUS = 12;
const CIRCLES5 = HUE_ANGLES.map((hue_angle, i) => {
  const theta = i * RADIAN_STEP;
  const center = SCREEN_CENTER.add(Direction.from_angle(theta).scale(110));
  const circle = new Circle(center, CIRCLE5_RADIUS);
  const style_circle = Style.flat(new Oklch(0.5, 0.1, hue_angle));
  return style(circle, style_circle);
});

const CIRCLE6_RADIUS = 18;
const CIRCLES6 = HUE_ANGLES.map((hue_angle, i) => {
  const theta = i * RADIAN_STEP;
  const center = SCREEN_CENTER.add(Direction.from_angle(theta).scale(150));
  const circle = new Circle(center, CIRCLE6_RADIUS);
  const style_circle = Style.flat(new Oklch(0.6, 0.1, hue_angle));
  return style(circle, style_circle);
});

const CIRCLE8_RADIUS = 32;
const CIRCLES8 = HUE_ANGLES.map((hue_angle, i) => {
  const theta = i * RADIAN_STEP;
  const center = SCREEN_CENTER.add(Direction.from_angle(theta).scale(260));
  const circle = new Circle(center, CIRCLE8_RADIUS);
  const style_circle = Style.flat(new Oklch(0.8, 0.1, hue_angle));
  return style(circle, style_circle);
});

const SCENE = group(
  ...CIRCLES5,
  ...CIRCLES6,
  ...CIRCLES,
  ...CIRCLES8,
  new GroupPrimitive(TEXT, {
    style: Style.flat(Color.WHITE),
    text_style: TEXT_STYLE_CENTERED,
  }),
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
    p.background(0);

    SCENE.draw(p);
  };
};
