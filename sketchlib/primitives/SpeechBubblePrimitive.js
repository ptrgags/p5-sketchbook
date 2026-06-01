import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Circle } from "./Circle.js";
import { Ellipse } from "./Ellipse.js";
import { PolygonPrimitive } from "./PolygonPrimitive.js";
import { Rect } from "./Rect.js";
import { group } from "./shorthand.js";

/**
 *
 * @param {Circle} circle
 * @param {Point} point
 * @return {[Point, Point]}
 */
function tangent_points(circle, point) {
  const to_point = point.sub(circle.center);

  // d = |point - center|
  const dist = to_point.mag();

  // Since the radius of the circle (r) and the tangent segment (t)
  // make a right anglee the area of the kite equals the product of those
  // two lengths
  // A = r * t
  //
  // But you could also compute the area as the sum of two triangular halves
  // with the distance to the point (d) as the base and the perpendicular
  // distance (b) as the height.
  //
  // A = 2 * (1/2 b * d) = b * d
  //
  // so r * t = b * d
  //    r * t / d = b
  //
  // in the end we'll only need this for a ratio, so sqrt
  const tangental_dist = Math.sqrt(dist * dist - circle.radius * circle.radius);
  const perp_dist = (circle.radius * tangental_dist) / dist;
  const parallel_dist = Math.sqrt(
    circle.radius * circle.radius - perp_dist * perp_dist,
  );

  const dir_to_point = to_point.normalize();
  const dir_perp = dir_to_point.rot90();
  const parallel = dir_to_point.scale(parallel_dist);
  const perp = dir_perp.scale(perp_dist);
  const tangent1 = circle.center.add(parallel).add(perp);
  const tangent2 = circle.center.add(parallel).add(perp.neg());

  return [tangent1, tangent2];
}

export class SpeechBubblePrimitive {
  /**
   * Constructor
   * @param {Rect} content_bounds Bounds for the content inside the speech bubble
   * @param {Direction} margin How far the bubble extends past the content bounds in the x and y direction
   * @param {Point} tip Tip of the tail of the speech bubble
   * @param {number} [tail_thickness=0.5] scale factor (usuaully in [0, 1]) to adjust the thickness where the tail meets a circle inside the speech bubble
   */
  constructor(content_bounds, margin, tip, tail_thickness = 0.5) {
    const center = content_bounds.center;

    const radii = content_bounds.dimensions.scale(0.5).add(margin);

    const bubble = new Ellipse(center, radii);

    // To compute the tail, look at
    const tail_circle = new Circle(
      center,
      tail_thickness * Math.min(radii.x, radii.y),
    );
    const [tangent1, tangent2] = tangent_points(tail_circle, tip);
    const tail = new PolygonPrimitive([tip, tangent1, tangent2], true);

    this.primitive = group(bubble, tail);
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}
