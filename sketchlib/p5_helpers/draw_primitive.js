import { Point } from "../../pga2d/objects.js";
import { Motor } from "../../pga2d/versors.js";
import { GroupPrimitive } from "../rendering/GroupPrimitive.js";
import {
  LinePrimitive,
  RectPrimitive,
  PolygonPrimitive,
  BezierPrimitive,
  PointPrimitive,
  CirclePrimitive,
  BeziergonPrimitive,
  VectorPrimitive,
  TextPrimitive,
  ArcPrimitive,
} from "../rendering/primitives.js";
import { TextStyle } from "../rendering/TextStyle.js";
import { Transform } from "../rendering/Transform.js";
import { Style } from "../Style.js";

/**
 * Draw a rectangle to the screen
 * @param {import("p5")} p p5.js library
 * @param {RectPrimitive} rect The rectangle to draw
 */
function draw_rect(p, rect) {
  const { x, y } = rect.position;
  const { x: w, y: h } = rect.dimensions;
  p.rect(x, y, w, h);
}

const POINT_RADIUS = 4;
/**
 * Draw a point as a small circle
 * @param {import("p5")} p The p5.js library
 * @param {PointPrimitive} point The point to draw
 */
function draw_point(p, point) {
  const { x, y } = point.position;
  p.circle(x, y, 2 * POINT_RADIUS);
}

/**
 * Draw a circle
 * @param {import("p5")} p The p5.js library
 * @param {CirclePrimitive} circle The circle to draw
 */
function draw_circle(p, circle) {
  const { x, y } = circle.position;
  p.circle(x, y, 2 * circle.radius);
}

/**
 * Draw a circular arc
 * @param {import("p5")} p the p5.js library
 * @param {ArcPrimitive} arc The arc to draw
 */
function draw_arc(p, arc) {
  const { center, radius, angles } = arc;
  const { x, y } = center;
  const diameter = 2 * radius;

  let { start_angle, end_angle } = angles;

  // p5.js's arc command specifies angles in CW order from start to stop.
  // If the direction of the arc is backwards, we need to swap the order
  // of the arguments.
  if (angles.direction === -1) {
    [start_angle, end_angle] = [end_angle, start_angle];
  }

  // Note: p5 is y-down so we need to flip the angles
  p.arc(x, y, diameter, diameter, start_angle, end_angle, p.OPEN);
}

/**
 * Draw a line segment
 * @param {import("p5")} p The p5.js library
 * @param {LinePrimitive} line The line segment to draw
 */
function draw_line(p, line) {
  const a = line.a;
  const b = line.b;
  p.line(a.x, a.y, b.x, b.y);
}

/**
 * Draw a closed polygon
 * @param {import("p5")} p The p5.js library
 * @param {PolygonPrimitive} polygon The polygon to draw
 */
function draw_polygon(p, polygon) {
  p.beginShape();
  for (const vertex of polygon) {
    p.vertex(vertex.x, vertex.y);
  }
  p.endShape(p.CLOSE);
}

const ARROW_ANGLE = Math.PI / 6;

/**
 * Draw a vector as an arrow. This only uses lines so styling only
 * comes from a stroke
 * @param {import("p5")} p p5.js library
 * @param {VectorPrimitive} vector The vector to draw
 */
function draw_vector(p, vector) {
  const { tail, tip } = vector;
  p.line(tail.x, tail.y, tip.x, tip.y);
  const rotate = Motor.rotation(tip, ARROW_ANGLE);
  const inv_rotate = rotate.reverse();

  const tip_back = Point.lerp(tail, tip, 0.8);
  const tip_left = rotate.transform_point(tip_back);
  const tip_right = inv_rotate.transform_point(tip_back);

  p.line(tip_left.x, tip_left.y, tip.x, tip.y);
  p.line(tip_right.x, tip_right.y, tip.x, tip.y);
}

/**
 * Draw a beziergon as a single shape with bezier vertices
 * @param {import("p5")} p The p5.js library
 * @param {BeziergonPrimitive} beziergon The beziergon to draw
 */
function draw_beziergon(p, beziergon) {
  p.beginShape();
  const first_point = beziergon.curves[0].a;
  p.vertex(first_point.x, first_point.y);
  for (const { b, c, d } of beziergon) {
    p.bezierVertex(b.x, b.y, c.x, c.y, d.x, d.y);
  }
  p.endShape();
}

/**
 * Draw a single bezier curve
 * @param {import("p5")} p The p5.js library
 * @param {BezierPrimitive} bezier The bezier curve to draw
 */
function draw_bezier(p, bezier) {
  const { a, b, c, d } = bezier;
  p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
}

/**
 * Draw text.
 * @param {import("p5")} p p5.js context
 * @param {TextPrimitive} text_primitive the text primitive to render
 */
function draw_text(p, text_primitive) {
  const { x, y } = text_primitive.position;
  p.text(text_primitive.text, x, y);
}

/**
 * Apply stroke and fill styling
 * @param {import("p5")} p p5.js context
 * @param {Style} style The style to use
 */
function apply_style(p, style) {
  if (style.stroke) {
    const { r, g, b } = style.stroke;
    p.stroke(r, g, b);
  } else {
    p.noStroke();
  }

  if (style.fill) {
    const { r, g, b } = style.fill;
    p.fill(r, g, b);
  } else {
    p.noFill();
  }

  p.strokeWeight(style.stroke_width);
}

/**
 * Convert string align values to p5.js constants
 * @param {import("p5")} p p5.js library
 * @param {"left" | "center" | "right"} h_align The horizontal align value
 * @returns {import("p5").HORIZ_ALIGN} the corresponding p5.js constant
 */
function get_horizontal_align(p, h_align) {
  switch (h_align) {
    case "center":
      return p.CENTER;
    case "right":
      return p.RIGHT;
    default:
      return p.LEFT;
  }
}

/**
 * Convert string align values to p5.js constants
 * @param {import("p5")} p p5.js library
 * @param {"top" | "bottom" | "center" | "baseline"} v_align The vertical align value
 * @returns {import("p5").VERT_ALIGN} The corresponding p5.js constant
 */
function get_vertical_align(p, v_align) {
  switch (v_align) {
    case "center":
      return p.CENTER;
    case "top":
      return p.TOP;
    case "baseline":
      return p.BASELINE;
    default:
      return p.BOTTOM;
  }
}

/**
 * Apply any text styles present in a TextStyle object
 * @param {import("p5")} p p5.js library
 * @param {TextStyle} text_style The text style
 */
function apply_text_style(p, text_style) {
  if (text_style.size !== undefined) {
    p.textSize(text_style.size);
  }

  const h_align = text_style.h_align
    ? get_horizontal_align(p, text_style.h_align)
    : undefined;
  const v_align = text_style.v_align
    ? get_vertical_align(p, text_style.v_align)
    : undefined;

  if (h_align || v_align) {
    p.textAlign(h_align, v_align);
  }
}

/**
 * Apply a transform
 * @param {import("p5")} p p5.js library
 * @param {Transform} transform The transform to apply
 */
function apply_transform(p, transform) {
  const translation = transform.translation;
  p.translate(translation.x, translation.y);
}

/**
 * Draw a group primitive. This will always push a new drawing state, apply
 * any settings, and pop at the end.
 * @param {import("p5")} p p5.js library
 * @param {GroupPrimitive} group the group to render
 */
function draw_group(p, group) {
  p.push();
  if (group.style) {
    apply_style(p, group.style);
  }

  if (group.text_style) {
    apply_text_style(p, group.text_style);
  }

  if (group.transform) {
    apply_transform(p, group.transform);
  }

  for (const child of group) {
    draw_primitive(p, child);
  }

  p.pop();
}

/**
 * Render a primitive, recursing over groups
 * @param {import("p5")} p The p5.js drawing library
 * @param {import("../rendering/GroupPrimitive.js").Primitive} primitive The root primitive to draw
 */
export function draw_primitive(p, primitive) {
  if (primitive instanceof GroupPrimitive) {
    draw_group(p, primitive);
  } else if (primitive instanceof RectPrimitive) {
    draw_rect(p, primitive);
  } else if (primitive instanceof LinePrimitive) {
    draw_line(p, primitive);
  } else if (primitive instanceof VectorPrimitive) {
    draw_vector(p, primitive);
  } else if (primitive instanceof PolygonPrimitive) {
    draw_polygon(p, primitive);
  } else if (primitive instanceof BeziergonPrimitive) {
    draw_beziergon(p, primitive);
  } else if (primitive instanceof BezierPrimitive) {
    draw_bezier(p, primitive);
  } else if (primitive instanceof PointPrimitive) {
    draw_point(p, primitive);
  } else if (primitive instanceof TextPrimitive) {
    draw_text(p, primitive);
  } else if (primitive instanceof CirclePrimitive) {
    draw_circle(p, primitive);
  } else if (primitive instanceof ArcPrimitive) {
    draw_arc(p, primitive);
  } else {
    throw new Error(`unknown primitive ${primitive}`);
  }
}
