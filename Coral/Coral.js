import { fix_mouse_coords } from "../common/fix_mouse_coords.js";
import { Rect } from "./Rect.js";
import { vec2, sub, norm } from "./vector.js";
import { ControlPoint } from "./ControlPoint.js";
import { CoralTile } from "./CoralTile.js";

const WIDTH = 500;
const HEIGHT = 700;

const BIG_QUAD = new Rect(0, HEIGHT / 2 - WIDTH / 2, WIDTH, WIDTH);
const SMALL_QUADS = BIG_QUAD.subdivide_grid(4);

// prettier-ignore
const CONNECTION_ORDER = [
  0b1001, 0b1101, 0b1100, 0b1000,
  0b1011, 0b1111, 0b1110, 0b1010, 
  0b0011, 0b0111, 0b0110, 0b0010,
  0b0001, 0b0101, 0b0100, 0b0000,
];

const TILES = SMALL_QUADS.map(
  (quad, i) => new CoralTile(quad, CONNECTION_ORDER[i])
);

class Spline {
  constructor(control_points) {
    this.control_points = control_points;
  }

  log_params() {
    console.log("current control points:");
    for (const point of this.control_points) {
      console.log(
        "p:",
        point.position.x.toPrecision(3),
        point.position.y.toPrecision(3)
      );
      console.log(
        "v:",
        point.tangent.x.toPrecision(3),
        point.tangent.y.toPrecision(3)
      );
    }
  }
}

const SELECT_RADIUS = 8;
const SELECT_RADIUS_SQR = SELECT_RADIUS * SELECT_RADIUS;

class InteractiveVertex {
  constructor(control_point, constraint, tile_quad) {
    this.control_point = control_point;
    this.constraint = constraint;
    this.tile_quad = tile_quad;
  }

  get position() {
    return this.control_point.position;
  }

  is_hovering(mouse) {
    const position_world = this.tile_quad.uv_to_world(
      this.control_point.position
    );
    const dist_sqr = norm(sub(mouse, position_world));

    return dist_sqr < SELECT_RADIUS_SQR;
  }

  move(uv) {
    this.control_point.position = this.constraint.clamp(uv);
  }
}

class InteractiveTangent {
  constructor(control_point, constraint, tile_quad) {
    this.control_point = control_point;
    this.constraint = constraint;
    this.tile_quad = tile_quad;
  }

  get tip() {
    return this.control_point.forward_point;
  }

  is_hovering(mouse) {
    const position_world = this.tile_quad.uv_to_world(
      this.control_point.forward_point
    );
    const dist_sqr = norm(sub(mouse, position_world));

    return dist_sqr < SELECT_RADIUS_SQR;
  }

  move(uv) {
    const tangent = sub(uv, this.control_point.position);
    this.control_point.tangent = this.constraint.clamp(tangent);
  }
}

const SPLINE = new Spline([
  new ControlPoint(vec2(0.75, 0.0), vec2(-0.21, 0.219)),
  new ControlPoint(vec2(0.75, 0.5), vec2(0.09, 0.204)),
  new ControlPoint(vec2(0.5, 0.934), vec2(-0.185, 0.055)),
  new ControlPoint(vec2(0.25, 0.5), vec2(0.11, -0.291)),
  new ControlPoint(vec2(0.25, 0.0), vec2(-0.095, -0.176)),
]);

const CONSTRAINTS = [
  new Rect(0.5, 0.0, 0.5, 0.0),
  new Rect(0.5, 0.5, 0.5, 0.0),
  new Rect(0.5, 0.5, 0.0, 0.5),
  new Rect(0.0, 0.5, 0.5, 0.0),
  new Rect(0.0, 0.0, 0.5, 0.0),
];

const VERTICES = SPLINE.control_points.map(
  (x, i) => new InteractiveVertex(x, CONSTRAINTS[i], SMALL_QUADS[0])
);

const TANGENT_CONSTRAINTS = [
  new Rect(-0.5, 0, 1.0, 0.5),
  new Rect(-0.5, 0, 1.0, 0.5),
  new Rect(-0.5, -0.5, 0.5, 1.0),
  new Rect(-0.5, -0.5, 1.0, 0.5),
  new Rect(-0.5, -0.5, 1.0, 0.5),
];

const TANGENTS = SPLINE.control_points.map(
  (x, i) => new InteractiveTangent(x, TANGENT_CONSTRAINTS[i], SMALL_QUADS[0])
);

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

function draw_tile_spline(p, tile) {
  const quad = tile.quad;
  for (let i = 0; i < tile.control_points.length - 1; i++) {
    const start = tile.control_points[i];
    const end = tile.control_points[i + 1];

    const a = quad.uv_to_world(start.position);
    const b = quad.uv_to_world(start.forward_point);
    const c = quad.uv_to_world(end.backward_point);
    const d = quad.uv_to_world(end.position);

    p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
  }
}

const CONNECT_POINTS = [
  vec2(1.0, 0.5),
  vec2(0.5, 1.0),
  vec2(0.0, 0.5),
  vec2(0.5, 0.0),
];

function draw_tile_connections(p, tile) {
  const quad = tile.quad;
  const flags = tile.connection_flags;
  const center = quad.uv_to_world(vec2(0.5, 0.5));
  for (let i = 0; i < 4; i++) {
    if (!((flags >> i) & 1)) {
      continue;
    }

    const connect_point = quad.uv_to_world(CONNECT_POINTS[i]);
    p.line(center.x, center.y, connect_point.x, connect_point.y);
  }
}

export const sketch = (p) => {
  let canvas;
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
    for (const tile of TILES) {
      //draw_tile_spline(p, tile);
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
    if (selected_tangent) {
      const position = BIG_QUAD.uv_to_world(selected_tangent.tip);
      p.circle(position.x, position.y, SELECT_RADIUS * 2);
    } else if (selected_vertex) {
      const position = BIG_QUAD.uv_to_world(selected_vertex.position);
      p.circle(position.x, position.y, SELECT_RADIUS * 2);
    }
  };

  let selected_vertex;
  let selected_tangent;
  p.mousePressed = () => {
    if (!canvas) {
      return;
    }

    const [mx, my] = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    const mouse = { x: mx, y: my };

    for (const tangent of TANGENTS) {
      if (tangent.is_hovering(mouse)) {
        selected_tangent = tangent;
        return;
      }
    }

    for (const vertex of VERTICES) {
      if (vertex.is_hovering(mouse)) {
        selected_vertex = vertex;
        return;
      }
    }
  };

  p.mouseDragged = () => {
    const [mx, my] = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    const mouse = { x: mx, y: my };

    const uv = BIG_QUAD.world_to_uv(mouse);

    if (selected_tangent) {
      selected_tangent.move(uv);
    } else if (selected_vertex) {
      selected_vertex.move(uv);
    }
  };

  p.mouseReleased = () => {
    selected_vertex = undefined;
    selected_tangent = undefined;
    SPLINE.log_params();
  };
};
