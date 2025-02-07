import {
  LinePrimitive,
  RectPrimitive,
  PolygonPrimitive,
  GroupPrimitive,
} from "./primitives.js";

function draw_rect(p, rect) {
  const { x, y } = rect.position;
  const { x: w, y: h } = rect.dimensions;
  p.rect(x, y, w, h);
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
  }
}
