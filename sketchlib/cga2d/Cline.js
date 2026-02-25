import { Line } from "../pga2d/Line.js";
import { Point } from "../pga2d/Point.js";
import { is_nearly } from "../is_nearly.js";
import { Circle } from "../primitives/Circle.js";
import { COdd } from "./COdd.js";
import { CEven } from "./CEven.js";
import { ConformalBasis } from "./ConformalBasis.js";

/**
 * Compute a cline primitive
 * @param {COdd} vector
 * @returns {Circle | Line}
 */
function compute_primitive(vector) {
  const { x, y, p, m } = vector;

  // First, check if we have a circle or line.
  // a circle has the form center + 1/2(center^2 - radius^2)inf + o
  // a line has the form n + d inf
  const o = m - p;
  if (is_nearly(o, 0)) {
    const inf = 0.5 * (m + p);
    return new Line(x, y, inf);
  }

  // Circle or null point

  // Normalize so the o component is 1;
  const center_x = x / o;
  const center_y = y / o;
  const center = new Point(center_x, center_y);

  // the infinity component is 1/2(m + p)/o after normalization
  // however, we'll cancel the 1/2 factor in a sec
  const twice_inf = (m + p) / o;

  // twice_inf = (center^2 - r^2), solve for r
  // r^2 = center^2 - twice_inf
  // r = sqrt(center^2 - twice_inf)
  const center_sqr = center_x * center_x + center_y * center_y;

  const discriminant = center_sqr - twice_inf;
  if (discriminant < 0) {
    // Not sure how to interpret a negative radius here
    throw new Error("trying to render circle with negative radius");
  }

  const radius = Math.sqrt(center_sqr - twice_inf);
  return new Circle(center, radius);
}

/**
 * Generalized Circle. This includes circles, lines and null points
 */
export class Cline {
  /**
   * Constructor
   * @param {COdd} vector
   */
  constructor(vector) {
    this.vector = vector;

    /**
     * @type {Line | Circle}
     */
    this.primitive = compute_primitive(vector);
  }

  /**
   * Draw the cline to the screen
   * @param {import('p5')} p P5.js library
   * @returns
   */
  draw(p) {
    this.primitive.draw(p);
  }

  /**
   *
   * @param {COdd | CEven} versor
   */
  transform(versor) {
    const vec = versor.unit_sandwich_odd(this.vector);
    return new Cline(vec);
  }

  /**
   * Create a generalized circle/line from a circle
   * @param {Circle} circle
   */
  static from_circle(circle) {
    const { center, radius } = circle;
    const { x, y } = center;

    // The rest of the components are expressed in
    // the inf, o basis
    // 1/2 A inf + o
    // where
    // A = (x^2 + y^2 - r^2)
    const squared_factor = x * x + y * y - radius * radius;
    const inf = 0.5 * squared_factor;
    const o = 1;

    const m = ConformalBasis.get_m(inf, o);
    const p = ConformalBasis.get_p(inf, o);
    return new Cline(new COdd(x, y, p, m, 0, 0, 0, 0));
  }

  /**
   *
   * @param {Line} line
   * @returns
   */
  static from_line(line) {
    const { nx, ny, d } = line;

    // n + d inf
    // = n + d(m + p)
    const x = nx;
    const y = ny;
    const m = d;
    const p = d;

    return new Cline(new COdd(x, y, p, m, 0, 0, 0, 0));
  }
}
