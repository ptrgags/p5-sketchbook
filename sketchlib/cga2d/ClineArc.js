import { ArcAngles } from "../ArcAngles.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { ArcPrimitive } from "../primitives/ArcPrimitive.js";
import { Circle } from "../primitives/Circle.js";
import { GroupPrimitive } from "../primitives/GroupPrimitive.js";
import { LinePrimitive } from "../primitives/LinePrimitive.js";
import { Primitive } from "../primitives/Primitive.js";
import { Ray } from "../primitives/Ray.js";
import { group } from "../primitives/shorthand.js";
import { CEven } from "./CEven.js";
import { Cline } from "./Cline.js";
import { COdd } from "./COdd.js";
import { NullPoint } from "./NullPoint.js";
import { lerp } from "../lerp.js";
import { Line } from "../pga2d/Line.js";

/**
 * Given the data for a cline arc that's known to be a finite circular arc,
 * compute the parameters for an ArcPrimitive for drawing
 * @param {Circle} circle The circle the arc lives on
 * @param {Point} a First point
 * @param {Point} b Second point
 * @param {Point} c Third point
 * @returns {ArcPrimitive} Arc from a -> b -> c
 */
function classify_circle_geometry(circle, a, b, c) {
  // Determine if the three points
  const ab = b.sub(a);
  const ac = c.sub(a);
  const is_ccw = ab.x * ac.y - ab.y * ac.x > 0.0;
  const direction = is_ccw ? 1 : -1;

  const theta_a = circle.get_angle(a);
  const theta_c = circle.get_angle(c);

  const angles = ArcAngles.from_raw_angles(theta_a, theta_c, direction);
  return new ArcPrimitive(circle.center, circle.radius, angles);
}

/**
 *
 * @param {NullPoint} a First point
 * @param {NullPoint} b Second point
 * @param {NullPoint} c Third point
 * @returns {Ray | GroupPrimitive | LinePrimitive}
 */
function classify_line_geometry(a, b, c) {
  if (a.is_inf) {
    // we have a ray inf -> b -> c
    // but we render it as inf <- c
    const to_infinity = b.point.sub(c.point);
    return new Ray(c.point, to_infinity);
  }

  if (c.is_inf) {
    // We have a ray a -> b -> inf
    const to_infinity = b.point.sub(a.point);
    return new Ray(a.point, to_infinity);
  }

  if (b.is_inf) {
    // the arc goes to infinity and beyond...
    // a -> inf -> c
    // but on the screen it looks like 2 rays inf <- a   c -> inf
    const to_infinity = c.point.sub(a.point);
    return group(
      new Ray(a.point, to_infinity.neg()),
      new Ray(c.point, to_infinity),
    );
  }

  // all three points are finite so we need to check if they're in the order
  // a -> b -> c, in which case we have a line segment.
  const ab = b.point.sub(a.point);
  const bc = c.point.sub(b.point);
  const in_order = ab.dot(bc) > 0.0;

  if (in_order) {
    return new LinePrimitive(a.point, b.point);
  }

  // If we got here, we have a case where the line segment goes through
  // infinity like
  //   inf <- a   c <- b <- inf or
  //   inf <- b <- a   c -> inf
  // either way,  on the screen it looks like two rays at a and c pointing
  // away from each other.
  const ac = c.point.sub(a.point);
  return group(new Ray(a.point, ac.neg()), new Ray(c.point, ac));
}

/**
 * Classify the arc as a circular arc, a line segment, a ray, or a pair of rays
 * @param {Cline} cline Cline that defines the arc
 * @param {NullPoint} a first point on arc
 * @param {NullPoint} b second point on arc
 * @param {NullPoint} c third point on arc
 * @returns {Primitive}
 */
function classify_geometry(cline, a, b, c) {
  if (cline.primitive instanceof Circle) {
    return classify_circle_geometry(cline.primitive, a.point, b.point, c.point);
  } else {
    return classify_line_geometry(a, b, c);
  }
}

/**
 * A Cline Arc is a generalized circular arc, which in the plane can be
 * a line segment, a ray, a pair of rays, or a circular arc
 * @see {@link https://github.com/ptrgags/math-notebook/blob/main/mobius/src/cline_arc.rs | math-notebook} for the original Rust implementation
 * @implements {Primitive}
 */
export class ClineArc {
  /**
   * Constructor
   * @param {Cline} cline Full generalized circle representing this arc
   * @param {NullPoint} a First end point of arc
   * @param {NullPoint} b Point in between a and c, this determines the orientation of the arc
   * @param {NullPoint} c End point of arc
   */
  constructor(cline, a, b, c) {
    this.cline = cline;
    this.a = a;
    this.b = b;
    this.c = c;

    this.primitive = classify_geometry(this.cline, this.a, this.b, this.c);
  }

  /**
   * Transform this cline arc
   * @param {COdd | CEven} versor
   * @returns {ClineArc}
   */
  transform(versor) {
    const cline = this.cline.transform(versor);
    const a = this.a.transform(versor);
    const b = this.b.transform(versor);
    const c = this.c.transform(versor);
    return new ClineArc(cline, a, b, c);
  }

  /**
   * Draw the cline
   * @param {import("p5")} p P5.js library
   */
  draw(p) {
    this.primitive.draw(p);
  }

  /**
   * Construct from a line segment
   * @param {LinePrimitive} segment
   * @returns {ClineArc}
   */
  static from_segment(segment) {
    const { a, b: c } = segment;
    const midpoint = Point.lerp(a, c, 0.5);
    const cline = Cline.from_line(Line.from_segment(segment));

    return new ClineArc(
      cline,
      NullPoint.from_point(a),
      NullPoint.from_point(midpoint),
      NullPoint.from_point(c),
    );
  }

  /**
   * Construct from an ArcPrimitive
   * @param {ArcPrimitive} arc
   * @returns {ClineArc}
   */
  static from_arc(arc) {
    const { center, radius, angles } = arc;
    const { start_angle, end_angle } = angles;
    const mid_angle = lerp(start_angle, end_angle, 0.5);
    const a = center.add(Direction.from_angle(start_angle).scale(radius));
    const b = center.add(Direction.from_angle(mid_angle).scale(radius));
    const c = center.add(Direction.from_angle(end_angle).scale(radius));
    const cline = Cline.from_circle(new Circle(center, radius));
    return new ClineArc(
      cline,
      NullPoint.from_point(a),
      NullPoint.from_point(b),
      NullPoint.from_point(c),
    );
  }
}
