function compute_tangent_points(point, direction) {
  const [x, y] = point;
  const [dx, dy] = direction;

  const forward = [x + dx, y + dy];
  const backward = [x - dx, y - dy];

  return [forward, backward];
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function uv_to_world(point) {
  const { x: u, y: v } = point;

  return {
    x: 250 - 100 + u * 200,
    y: 350 + 100 - v * 200,
  };
}

class ControlPoint {
  constructor(x, y, dx, dy) {
    this.position = { x, y };
    this.tangent = { x: dx, y: dy };

    this.forward_point = add(this.position, this.tangent);
    this.backward_point = sub(this.position, this.tangent);
  }
}

class Spline {
  constructor(control_points) {
    this.control_points = control_points;
  }
}

const SPLINE = new Spline([
  new ControlPoint(0.75, 0.0, 0.0, 0.1),
  new ControlPoint(0.75, 0.5, -0.1, 0.1),
  new ControlPoint(0.5, 0.75, -0.1, 0.0),
  new ControlPoint(0.25, 0.5, 0.2, -0.1),
  new ControlPoint(0.25, 0.0, 0.1, -0.1),
]);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    p.stroke(127);
    p.noFill();
    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.rect(-100, -100, 200, 200);
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
  };
};
