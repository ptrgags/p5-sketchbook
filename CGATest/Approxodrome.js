import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { lerp } from "../sketchlib/lerp.js";

/**
 *
 * @param {number} t
 * @returns {number}
 */
function transfer(t) {
  return -t / (t * t - 1);
}

const MAX_DEPTH = 15;

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
 * @param {CVersor} to_screen
 * @param {NullPoint} a
 * @param {NullPoint} b
 * @returns {LineSegment}
 */
function make_line(to_screen, a, b) {
  const a_screen = a.transform(to_screen.versor).point;
  const b_screen = b.transform(to_screen.versor).point;
  return new LineSegment(a_screen, b_screen);
}

/**
 *
 * @param {CVersor} to_screen
 * @param {NullPoint} a
 * @param {NullPoint} b
 * @param {NullPoint} start_point
 * @param {number} t_a
 * @param {number} t_b
 * @param {function(number): CVersor} curve
 * @param {number} depth
 * @returns {LineSegment[]}
 */
function approxodrome(to_screen, a, b, start_point, t_a, t_b, curve, depth) {
  if (depth >= MAX_DEPTH) {
    return [make_line(to_screen, a, b)];
  }

  const predicted_middle = mid_null(a, b);

  const t_mid = lerp(t_a, t_b, 0.5);
  const middle_lox = curve(t_mid);
  const actual_middle = start_point.transform(middle_lox.versor);

  const diff = predicted_middle.point.dist_sqr(actual_middle.point);

  if (is_nearly(diff, 0)) {
    return [make_line(to_screen, a, b)];
  }

  return [
    ...approxodrome(
      to_screen,
      a,
      actual_middle,
      start_point,
      t_a,
      t_mid,
      curve,
      depth + 1,
    ),
    ...approxodrome(
      to_screen,
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

/**
 *
 * @param {CVersor} to_screen
 * @param {function(number): CVersor} curve
 * @param {[NullPoint, NullPoint]} fixed_points
 * @return {LineSegment[]} segments to draw
 */
export function compute_loxodrome(to_screen, curve, fixed_points) {
  const [minus, plus] = fixed_points;
  const mid = mid_null(plus, minus);

  const depth = 0;
  return [
    ...approxodrome(to_screen, minus, mid, mid, -1, 0, curve, depth),
    ...approxodrome(to_screen, mid, plus, mid, 0, 1, curve, depth),
  ];
}

/**
 * @implements {Primitive}
 */
export class Approxodrome {
  /**
   * Constructor
   * @param {CVersor} to_screen The to-screen transformation
   * @param {Direction} direction Direction. It will be normalized.
   * @param {number} scale_factor Scale factor. Must be postivie
   * @param {number} rotation_angle Rotation angle
   */
  constructor(to_screen, direction, scale_factor, rotation_angle) {
    direction = direction.normalize();

    /**
     * @type {[NullPoint, NullPoint]}
     */
    const fixed_points = [
      NullPoint.from_point(direction.to_point()),
      NullPoint.from_point(direction.neg().to_point()),
    ];

    const segments = compute_loxodrome(
      to_screen,
      (t) => {
        const power = transfer(t);
        return CVersor.loxodromic(
          direction,
          scale_factor ** power,
          rotation_angle * power,
        );
      },
      fixed_points,
    );
    this.primitive = group(...segments);
  }

  draw(p) {
    this.primitive.draw(p);
  }
}
