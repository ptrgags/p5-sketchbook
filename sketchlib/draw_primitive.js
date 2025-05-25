import { Point } from "../pga2d/objects.js";
import { Motor } from "../pga2d/versors.js";
import {
  LinePrimitive,
  RectPrimitive,
  PolygonPrimitive,
  GroupPrimitive,
  BezierPrimitive,
  PointPrimitive,
  CirclePrimitive,
  BeziergonPrimitive,
  VectorPrimitive,
  TextPrimitive,
} from "./primitives.js";

function draw_rect(p, rect) {
  const { x, y } = rect.position;
  const { x: w, y: h } = rect.dimensions;
  p.rect(x, y, w, h);
}

const POINT_RADIUS = 4;
function draw_point(p, point) {
  const { x, y } = point.position;
  p.circle(x, y, 2 * POINT_RADIUS);
}

function draw_circle(p, circle) {
  const { x, y } = circle.position;
  p.circle(x, y, 2 * circle.radius);
}

function draw_line(p, line) {
  const a = line.a;
  const b = line.b;
  p.line(a.x, a.y, b.x, b.y);
}

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
 * @param {any} p p5 context
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

function draw_beziergon(p, beziergon) {
  p.beginShape();
  const first_point = beziergon.curves[0].a;
  p.vertex(first_point.x, first_point.y);
  for (const { b, c, d } of beziergon) {
    p.bezierVertex(b.x, b.y, c.x, c.y, d.x, d.y);
  }
  p.endShape();
}

function draw_bezier(p, bezier) {
  const { a, b, c, d } = bezier;
  p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
}

/**
 * Draw text. This will likely change to move the text styling to the
 * GroupPrimitive level
 * @private
 * @param {any} p p5.js context
 * @param {TextPrimitive} text_primitive the text primitive to render
 */
function draw_text(p, text_primitive) {
  p.push();

  p.textSize(text_primitive.text_style.size);

  if (text_primitive.text_style.align === "center") {
    p.textAlign(p.CENTER);
  }

  const { x, y } = text_primitive.position;
  p.text(text_primitive.text, x, y);
  p.pop();
}

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

function draw_group(p, group) {
  p.push();
  if (group.style) {
    apply_style(p, group.style);
  }

  for (const child of group) {
    draw_primitive(p, child);
  }

  p.pop();
}

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
  } else {
    throw new Error(`unknown primitive ${primitive}`);
  }
}
