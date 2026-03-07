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
import { IFS } from "../sketchlib/cga2d/IFS.js";
import { AnimatedSierpinski } from "./AnimatedSierpinski.js";
import { ProgressivePrimitive } from "../sketchlib/primitives/ProgressivePrimitive.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CGA_BASICS } from "./cga_basics.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";
import { BIG_UNIT_CIRCLE, TO_SCREEN } from "./common.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { SIERPINSKI_TILES } from "./progressive_sierpinski.js";
import { Clock } from "./Clock.js";

const SPIN_STYLE = new Style({
  stroke: new Color(0, 255, 127),
});

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

const SIERPINSKI = new AnimationGroup(
  SIERPINSKI_TILES,
  new AnimatedSierpinski(TO_SCREEN),
);

const ANIMATIONS = new SelectAnimated([CGA_BASICS, SIERPINSKI]);

const MOUSE = new CanvasMouseHandler();

const CLOCK = new Clock();
const BPM = 128;

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

    const t_measures = CLOCK.get_elapsed_measures(BPM);

    ANIMATIONS.update(t_measures);
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
  };

  MOUSE.mouse_released(p, (input) => {
    if (input.in_canvas !== MouseInCanvas.IN_CANVAS) {
      return;
    }

    ANIMATIONS.next();
  });
};
