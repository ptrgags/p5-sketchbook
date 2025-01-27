import { fix_mouse_coords } from "../common/fix_mouse_coords.js";

const WIDTH = 500;
const HEIGHT = 700;

const QUAD_X = WIDTH / 2 - 100;
const QUAD_Y = HEIGHT / 2 - 100;
const QUAD_WIDTH = 200;
const QUAD_HEIGHT = 200;

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function norm(v) {
  return v.x * v.x + v.y * v.y;
}

function uv_to_world(point) {
  const { x: u, y: v } = point;

  return {
    x: QUAD_X + u * QUAD_WIDTH,
    y: QUAD_Y + (1 - v) * QUAD_HEIGHT,
  };
}

function clamp(x, min, max) {
  return Math.max(Math.min(x, max), min);
}

class Rect {
  constructor(x, y, width, height) {
    this.position = { x, y };
    this.dimensions = { x: width, y: height };
  }

  clamp(point) {
    const { x, y } = point;

    return {
      x: clamp(x, this.position.x, this.position.x + this.dimensions.x),
      y: clamp(y, this.position.y, this.position.y + this.dimensions.y),
    };
  }
}

class ControlPoint {
  constructor(x, y, dx, dy) {
    this._position = { x, y };
    this.tangent = { x: dx, y: dy };

    this.forward_point = add(this._position, this.tangent);
    this.backward_point = sub(this._position, this.tangent);
  }

  get position() {
    return this._position;
  }

  set position(value) {
    this._position = value;
    this.forward_point = add(this._position, this.tangent);
    this.backward_point = sub(this._position, this.tangent);
  }
}

class Spline {
  constructor(control_points) {
    this.control_points = control_points;
  }
}

const SELECT_RADIUS = 8;
const SELECT_RADIUS_SQR = SELECT_RADIUS * SELECT_RADIUS;

class InteractiveVertex {
  constructor(control_point, constraint) {
    this.control_point = control_point;
    this.constraint = constraint;
  }

  get position() {
    return this.control_point.position;
  }

  is_hovering(mouse) {
    const position_world = uv_to_world(this.control_point.position);
    const dist_sqr = norm(sub(mouse, position_world));

    return dist_sqr < SELECT_RADIUS_SQR;
  }

  move(uv) {
    this.control_point.position = this.constraint.clamp(uv);
  }
}

const SPLINE = new Spline([
  new ControlPoint(0.75, 0.0, 0.0, 0.1),
  new ControlPoint(0.75, 0.5, -0.1, 0.1),
  new ControlPoint(0.5, 0.75, -0.1, 0.0),
  new ControlPoint(0.25, 0.5, 0.2, -0.1),
  new ControlPoint(0.25, 0.0, 0.1, -0.1),
]);

const CONSTRAINTS = [
  new Rect(0.5, 0.0, 0.5, 0.0),
  new Rect(0.5, 0.5, 0.5, 0.0),
  new Rect(0.5, 0.5, 0.0, 0.5),
  new Rect(0.0, 0.5, 0.5, 0.0),
  new Rect(0.0, 0.0, 0.5, 0.0),
];

const VERTICES = SPLINE.control_points.map(
  (x, i) => new InteractiveVertex(x, CONSTRAINTS[i])
);

export const sketch = (p) => {
  let canvas;
  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;
  };

  p.draw = () => {
    p.background(0);

    p.stroke(127);
    p.noFill();
    p.rect(QUAD_X, QUAD_Y, QUAD_WIDTH, QUAD_HEIGHT);
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.line(0, -100, 0, 100);
    p.line(-100, 0, 100, 0);
    p.pop();

    // Draw the Hermite spline
    p.stroke(0, 255, 255);
    p.noFill();
    p.strokeWeight(2);
    for (let i = 0; i < SPLINE.control_points.length - 1; i++) {
      const start = SPLINE.control_points[i];
      const end = SPLINE.control_points[i + 1];

      const a = uv_to_world(start.position);
      const b = uv_to_world(start.forward_point);
      const c = uv_to_world(end.backward_point);
      const d = uv_to_world(end.position);

      p.bezier(a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y);
    }

    // Draw vertices
    p.stroke(255, 255, 0);
    p.strokeWeight(4);
    p.noFill();
    for (const point of SPLINE.control_points) {
      const pos = uv_to_world(point.position);
      p.point(pos.x, pos.y);
    }

    // Draw tangents
    p.stroke(0, 255, 0);
    p.noFill();
    p.strokeWeight(1);
    for (const point of SPLINE.control_points) {
      const a = uv_to_world(point.position);
      const b = uv_to_world(point.forward_point);
      p.line(a.x, a.y, b.x, b.y);
    }

    if (selected_vertex) {
      p.stroke(255);
      p.noFill();
      p.strokeWeight(1);
      const position = uv_to_world(selected_vertex.position);
      p.circle(position.x, position.y, SELECT_RADIUS * 2);
    }
  };

  let mouse = { x: 0, y: 0 };
  p.mouseMoved = () => {
    if (!canvas) {
      return;
    }

    const [mx, my] = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    mouse = { x: mx, y: my };
  };

  let selected_vertex;
  p.mousePressed = () => {
    if (!canvas) {
      return;
    }

    const [mx, my] = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    mouse = { x: mx, y: my };

    for (const vertex of VERTICES) {
      if (vertex.is_hovering(mouse)) {
        selected_vertex = vertex;
        break;
      }
    }
  };

  p.mouseDragged = () => {
    const [mx, my] = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    mouse = { x: mx, y: my };

    const u = (mx - QUAD_X) / QUAD_WIDTH;
    const v = 1 - (my - QUAD_Y) / QUAD_HEIGHT;

    if (selected_vertex) {
      selected_vertex.move({ x: u, y: v });
    }
  };

  p.mouseReleased = () => {
    selected_vertex = undefined;
  };
};
