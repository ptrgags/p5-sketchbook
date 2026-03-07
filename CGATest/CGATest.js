import { Point } from "../sketchlib/pga2d/Point.js";
import { Cline } from "../sketchlib/cga2d/Cline.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { range } from "../sketchlib/range.js";
import { mod } from "../sketchlib/mod.js";
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { AnimatedSierpinski } from "./AnimatedSierpinski.js";
import { ProgressivePrimitive } from "../sketchlib/primitives/ProgressivePrimitive.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CGA_BASICS } from "./cga_basics.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";

const SPIN_STYLE = new Style({
  stroke: new Color(0, 255, 127),
});

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT - 200),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const BIG_UNIT_CIRCLE = TO_SCREEN.transform(Cline.UNIT_CIRCLE);

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
  return parabolic.transform(Cline.Y_AXIS);
});

const SHRINK = CVersor.dilation(0.5);
const SIERPINSKI_IFS = new IFS([
  CVersor.translation(new Direction(-0.5, 0.5)).compose(SHRINK),
  CVersor.translation(new Direction(0.5, 0.5)).compose(SHRINK),
  CVersor.translation(new Direction(0, -0.5)).compose(SHRINK),
]);
const SIERPINSKI_TILES = new ProgressivePrimitive(
  SIERPINSKI_IFS.iterate(6).map((xform) => {
    return TO_SCREEN.compose(xform).transform(Cline.UNIT_CIRCLE);
  }),
  1,
);

const SIERPINSKI = new AnimatedSierpinski(TO_SCREEN);
const STYLED_SIERPINSKI = style(
  SIERPINSKI.primitive,
  new Style({
    fill: new Oklch(0.7676, 0.1381, 82.79),
    width: 2,
    stroke: new Oklch(0.66, 0.1381, 72.11),
  }),
);

const ANIMATIONS = new SelectAnimated([CGA_BASICS, SIERPINSKI]);

const MOUSE = new CanvasMouseHandler();

export const sketch = (p) => {
  p.setup = () => {
    const canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    ).elt;

    MOUSE.setup(canvas);
  };

  p.draw = () => {
    p.background(0);

    const t = p.frameCount / 500;
    const f = 3;
    const angle = 2.0 * Math.PI * f * t;

    const elliptic = CVersor.elliptic(Direction.DIR_Y, angle);
    const elliptic_screen = TO_SCREEN.compose(elliptic);
    const swirled_points = POINTS.map((x) => elliptic_screen.transform(x));

    const min_factor = 1;
    const max_factor = 100;
    const factor_t = 0.5 + 0.5 * Math.sin(t * 2.0 * Math.PI);
    const factor =
      Math.pow(min_factor, 1.0 - factor_t) * Math.pow(max_factor, factor_t);
    const hyperbolic = CVersor.hyperbolic(Direction.DIR_X, factor);
    const hyp_screen = TO_SCREEN.compose(hyperbolic);
    const hyp_points = POINTS.map((x) => hyp_screen.transform(x));

    const lox = elliptic.compose(hyperbolic);
    const lox_screen = TO_SCREEN.compose(lox);
    const lox_points = POINTS.map((x) => lox_screen.transform(x));

    const parabolic = CVersor.parabolic(new Direction(100.0 * t - 100, 0));
    const para_screen = TO_SCREEN.compose(parabolic);
    const para_points = POINTS2.map((x) => para_screen.transform(x));

    // Give the illusion of translating forever by drawing a whole bunch of tiles
    const t_repeat = mod(2 * t, 1.0);
    const para_illusion = CVersor.parabolic(PARABOLIC_STEP.scale(t_repeat));
    const para_ill_screen = TO_SCREEN.compose(para_illusion);
    const para_ill_tiles = PARABOLIC_TILES.map((x) =>
      para_ill_screen.transform(x),
    );

    const slice_t = Math.max((p.frameCount - 60 * 5) / 4, 0);
    SIERPINSKI_TILES.update(slice_t);

    ANIMATIONS.update(t);
    ANIMATIONS.primitive.draw(p);

    const styled = style(
      [BIG_UNIT_CIRCLE, ...lox_points, ...para_points, SIERPINSKI_TILES],
      SPIN_STYLE,
    );
    const styled2 = style(
      [...swirled_points, ...hyp_points, ...para_ill_tiles],
      SPIN_STYLE,
    );

    styled.draw(p);
    styled2.draw(p);

    SIERPINSKI.update(p.frameCount / 60);
    STYLED_SIERPINSKI.draw(p);
  };

  MOUSE.mouse_released(p, (input) => {
    if (input.in_canvas !== MouseInCanvas.IN_CANVAS) {
      return;
    }

    ANIMATIONS.next();
  });
};
