import { Color } from "../Color.js";
import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Style } from "../Style.js";
import { Circle } from "./Circle.js";
import { Ellipse } from "./Ellipse.js";
import { PolygonPrimitive } from "./PolygonPrimitive.js";
import { Rect } from "./Rect.js";
import { group, style } from "./shorthand.js";

const STYLE_OUTER = new Style({
  fill: Color.BLACK,
});
const STYLE_INNER = new Style({
  fill: Color.WHITE,
});

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
   * @param {Direction} margin How far the (inner) bubble extends past the content bounds in the x and y direction.
   * @param {Point} inner_tip Tip of the (inner) tail of the speech bubble
   * @param {number} outline_thickness Approximate thickness of the outline in pixels
   * @param {number} [tail_thickness=0.5] scale factor (usuaully in [0, 1]) to adjust the thickness where the tail meets a circle inside the speech bubble
   */
  constructor(
    content_bounds,
    margin,
    inner_tip,
    outline_thickness,
    tail_thickness = 0.5,
  ) {
    const center = content_bounds.center;

    const inner_radii = content_bounds.dimensions.scale(0.5).add(margin);
    const outer_radii = inner_radii.add(
      new Direction(outline_thickness, outline_thickness),
    );

    const to_tip = inner_tip.sub(center);
    const tail_length = to_tip.mag();
    const outer_tip = center.add(
      to_tip.set_length(tail_length + 4 * outline_thickness),
    );

    const outer_bubble = new Ellipse(center, outer_radii);
    const inner_bubble = new Ellipse(center, inner_radii);

    const inner_min_r = Math.min(inner_radii.x, inner_radii.y);
    const outer_min_r = Math.min(outer_radii.x, outer_radii.y);

    const inner_tail_circle = new Circle(center, tail_thickness * inner_min_r);
    const outer_tail_circle = new Circle(center, tail_thickness * outer_min_r);

    const [inner_tangent1, inner_tangent2] = tangent_points(
      inner_tail_circle,
      inner_tip,
    );
    const [outer_tangent1, outer_tangent2] = tangent_points(
      outer_tail_circle,
      outer_tip,
    );

    const inner_tail = new PolygonPrimitive(
      [inner_tip, inner_tangent1, inner_tangent2],
      true,
    );
    const outer_tail = new PolygonPrimitive(
      [outer_tip, outer_tangent1, outer_tangent2],
      true,
    );

    this.inner_primitiive = group(inner_bubble, inner_tail);
    this.outer_primitiive = group(outer_bubble, outer_tail);

    this.primitive = group(
      style(this.outer_primitiive, STYLE_OUTER),
      style(this.inner_primitiive, STYLE_INNER),
    );
  }

  /**
   *
   * @param {import("p5")} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}
