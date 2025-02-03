import { fix_mouse_coords } from "../common/fix_mouse_coords.js";
import { Rect } from "./Rect.js";
import { CoralTile } from "./CoralTile.js";
import { Point } from "../pga2d/objects.js";
import {
  SELECT_RADIUS,
  InteractiveTangent,
  InteractiveVertex,
} from "./interactive.js";
import { find_splines } from "./find_splines.js";

const WIDTH = 500;
const HEIGHT = 700;

const BIG_QUAD = new Rect(0, HEIGHT / 2 - WIDTH / 2, WIDTH, WIDTH);
const SMALL_QUADS = BIG_QUAD.subdivide_grid(4);

// prettier-ignore
const CONNECTION_ORDER = [
  // all 16 connection types, arranged in a 4x4 grid to form closed
  // loops.
  [0b1001, 0b1101, 0b1100, 0b1000],
  [0b1011, 0b1111, 0b1110, 0b1010], 
  [0b0011, 0b0111, 0b0110, 0b0010],
  [0b0001, 0b0101, 0b0100, 0b0000],
];

const TILES = SMALL_QUADS.map(
  ({ i, j }, quad) => new CoralTile(quad, CONNECTION_ORDER[i][j])
);

const VERTICES = [];
const TANGENTS = [];
for (const tile of TILES) {
  for (const [
    control_point,
    vertex_constraint,
    tangent_constraint,
  ] of tile.get_constraints()) {
    VERTICES.push(
      new InteractiveVertex(control_point, vertex_constraint, tile.quad)
    );
    TANGENTS.push(
      new InteractiveTangent(control_point, tangent_constraint, tile.quad)
    );
  }
}

// Order to check for mouse hits. Note that this doesn't scale well.
const SELECTION_ORDER = [...TANGENTS, ...VERTICES];

function draw_quad(p, rect) {
  const { x, y } = rect.position;
  const { x: w, y: h } = rect.dimensions;
  p.rect(x, y, w, h);
  p.line(x, y + h / 2, x + w, y + h / 2);
  p.line(x + w / 2, y, x + w / 2, y + h);
}

function draw_tile_tangents(p, tile) {
  const quad = tile.quad;
  for (const point of tile.control_points) {
    const a = quad.uv_to_world(point.position);
    const b = quad.uv_to_world(point.forward_point);
    p.line(a.x, a.y, b.x, b.y);
  }
}

function draw_tile_tangent_tips(p, tile) {
  const quad = tile.quad;
  for (const point of tile.control_points) {
    const pos = quad.uv_to_world(point.forward_point);
    p.point(pos.x, pos.y);
  }
}

function draw_tile_vertices(p, tile) {
  const quad = tile.quad;
  for (const point of tile.control_points) {
    const pos = quad.uv_to_world(point.position);
    p.point(pos.x, pos.y);
  }
}

const SPLINES = find_splines(TILES);

function draw_spline(p, spline) {
  for (const [a, b, c, d] of spline.to_bezier_world()) {
    p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  }
}

const CONNECT_POINTS = [
  Point.point(1.0, 0.5),
  Point.point(0.5, 1.0),
  Point.point(0.0, 0.5),
  Point.point(0.5, 0.0),
];

function draw_tile_connections(p, tile) {
  const quad = tile.quad;
  const flags = tile.connection_flags;
  const center = quad.uv_to_world(Point.point(0.5, 0.5));
  for (let i = 0; i < 4; i++) {
    if (!((flags >> i) & 1)) {
      continue;
    }

    const connect_point = quad.uv_to_world(CONNECT_POINTS[i]);
    p.line(center.x, center.y, connect_point.x, connect_point.y);
  }
}

function highlight_selction(p, selected_object) {
  const position = selected_object.position_world;
  p.circle(position.x, position.y, SELECT_RADIUS * 2);
}

export const sketch = (p) => {
  let canvas;
  let selected_object;

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;
  };

  p.draw = () => {
    p.background(0);

    p.stroke(127);
    p.noFill();
    for (const quad of SMALL_QUADS) {
      draw_quad(p, quad);
    }

    p.stroke(255, 127, 0);
    p.strokeWeight(4);
    p.noFill();
    for (const tile of TILES) {
      draw_tile_connections(p, tile);
    }

    // Draw the Bezier spline
    p.stroke(131, 71, 181);
    p.noFill();
    p.strokeWeight(2);
    for (const spline of SPLINES) {
      draw_spline(p, spline);
    }

    // Draw tangents
    p.stroke(0, 255, 0);
    p.noFill();
    p.strokeWeight(1);
    for (const tile of TILES) {
      draw_tile_tangents(p, tile);
    }

    // Draw a circle at the tips of the tangents
    p.stroke(0, 255, 0);
    p.noFill();
    p.strokeWeight(6);
    for (const tile of TILES) {
      draw_tile_tangent_tips(p, tile);
    }

    // Draw vertices
    p.stroke(255, 255, 0);
    p.strokeWeight(6);
    p.noFill();
    for (const tile of TILES) {
      draw_tile_vertices(p, tile);
    }

    p.stroke(255);
    p.noFill();
    p.strokeWeight(1);
    if (selected_object) {
      highlight_selction(p, selected_object);
    }
  };

  p.mousePressed = () => {
    if (!canvas) {
      return;
    }

    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    for (const object of SELECTION_ORDER) {
      if (object.is_hovering(mouse)) {
        selected_object = object;
        break;
      }
    }
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);

    if (selected_object) {
      selected_object.move(mouse);
    }
  };

  p.mouseReleased = () => {
    selected_object = undefined;
  };
};
