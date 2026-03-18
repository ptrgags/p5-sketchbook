import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { AnimatedSierpinski } from "./AnimatedSierpinski.js";
import { SelectAnimated } from "../sketchlib/animation/SelectAnimated.js";
import { CGA_BASICS } from "./cga_basics.js";
import { CanvasMouseHandler } from "../sketchlib/input/CanvasMouseHandler.js";
import { MouseInCanvas } from "../sketchlib/input/MouseInput.js";
import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { Clock } from "../sketchlib/animation/Clock.js";
import { ConformalXformTest } from "./ConformalXformTest.js";
import { NachoSpaceship } from "./NachoSpaceship.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { range } from "../sketchlib/range.js";
import { mod } from "../sketchlib/mod.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { lerp } from "../sketchlib/lerp.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { ProgressiveSierpinski } from "./ProgressiveSierpinski.js";
import { Tempo } from "../sketchlib/music/Tempo.js";
import { Circle } from "../sketchlib/primitives/Circle.js";

const TO_SCREEN = CVersor.to_screen(new Circle(SCREEN_CENTER, 200));

const ANIMATIONS = new SelectAnimated([
  CGA_BASICS,
  new ConformalXformTest(TO_SCREEN),
  new AnimationGroup(
    new ProgressiveSierpinski(TO_SCREEN),
    new AnimatedSierpinski(TO_SCREEN),
  ),
  new NachoSpaceship(TO_SCREEN),
]);

const MOUSE = new CanvasMouseHandler();

const CLOCK = new Clock();
const BPM = 128;

/**
 *
 * @param {number} t
 * @returns {number}
 */
function transfer(t) {
  return -t / (t * t - 1);
}

const MAX_DEPTH = 20;

/**
 *
 * @param {NullPoint} a
 * @param {NullPoint} b
 * @returns {NullPoint}
 */
function mid_null(a, b) {
  return NullPoint.from_point(Point.lerp(a.point, b.point, 0.5));
}

/**
 *
 * @param {NullPoint} a
 * @param {NullPoint} b
 * @returns {LinePrimitive}
 */
function make_line(a, b) {
  const a_screen = TO_SCREEN.transform_point(a).point;
  const b_screen = TO_SCREEN.transform_point(b).point;
  return new LinePrimitive(a_screen, b_screen);
}

/**
 *
 * @param {NullPoint} a
 * @param {NullPoint} b
 * @param {NullPoint} start_point
 * @param {number} t_a
 * @param {number} t_b
 * @param {function(number): CVersor} curve
 * @param {number} depth
 * @returns {LinePrimitive[]}
 */
function approxodrome(a, b, start_point, t_a, t_b, curve, depth) {
  if (depth >= MAX_DEPTH) {
    return [make_line(a, b)];
  }

  const predicted_middle = mid_null(a, b);

  const t_mid = lerp(t_a, t_b, 0.5);
  const middle_lox = curve(t_mid);
  const actual_middle = middle_lox.transform_point(start_point);

  const diff = predicted_middle.point.dist_sqr(actual_middle.point);

  if (is_nearly(diff, 0)) {
    console.log(depth);
    return [make_line(a, b)];
  }

  return [
    ...approxodrome(
      a,
      actual_middle,
      start_point,
      t_a,
      t_mid,
      curve,
      depth + 1,
    ),
    ...approxodrome(
      actual_middle,
      b,
      start_point,
      t_mid,
      t_b,
      curve,
      depth + 1,
    ),
  ];
}

// Is this https://en.wikipedia.org/wiki/Bisection_method?

/**
 *
 * @param {function(number): CVersor} curve
 * @param {[NullPoint, NullPoint]} fixed_points
 * @return {LinePrimitive[]} segments to draw
 */
function compute_loxodrome(curve, fixed_points) {
  const [minus, plus] = fixed_points;
  const mid = mid_null(plus, minus);

  const depth = 0;
  return [
    ...approxodrome(minus, mid, mid, -1, 0, curve, depth),
    ...approxodrome(mid, plus, mid, 0, 1, curve, depth),
  ];
}

function lox_curve(t) {
  const power = transfer(t);

  // the factor k^t = (r exp(i theta))^t = r^t exp(i t theta)
  const factor = 1.1 ** power;
  const angle = (power * Math.PI) / 16;

  return CVersor.loxodromic(Direction.DIR_Y, factor, angle);
}

const LOX = style(
  compute_loxodrome(lox_curve, [
    NullPoint.from_point(new Point(0, -1)),
    NullPoint.from_point(new Point(0, 1)),
  ]),
  SPIN_STYLE,
);

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

    const t_seconds = CLOCK.elapsed_time;
    const t_measures = Tempo.sec_to_measures(t_seconds, BPM);

    ANIMATIONS.update(t_measures);
    ANIMATIONS.primitive.draw(p);
    LOX.draw(p);
  };

  MOUSE.mouse_released(p, (input) => {
    if (input.in_canvas !== MouseInCanvas.IN_CANVAS) {
      return;
    }

    ANIMATIONS.next();
    CLOCK.reset();
  });
};
