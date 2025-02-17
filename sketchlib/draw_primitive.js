import {
  LinePrimitive,
  RectPrimitive,
  PolygonPrimitive,
  GroupPrimitive,
  BezierPrimitive,
  PointPrimitive,
  CirclePrimitive,
  BeziergonPrimitive,
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
  } else if (primitive instanceof PolygonPrimitive) {
    draw_polygon(p, primitive);
  } else if (primitive instanceof BeziergonPrimitive) {
    draw_beziergon(p, primitive);
  } else if (primitive instanceof BezierPrimitive) {
    draw_bezier(p, primitive);
  } else if (primitive instanceof PointPrimitive) {
    draw_point(p, primitive);
  } else if (primitive instanceof CirclePrimitive) {
    draw_circle(p, primitive);
  } else {
    throw new Error(`unknown primitive ${primitive}`);
  }
}
