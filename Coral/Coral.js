function compute_tangent_points(point, direction) {
  const [x, y] = point;
  const [dx, dy] = direction;

  const forward = [x + dx, y + dy];
  const backward = [x - dx, y - dy];

  return [forward, backward];
}

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(500, 700);
  };

  p.draw = () => {
    p.background(0);

    p.push();
    p.translate(p.width / 2, p.height / 2);

    p.stroke(127);
    p.noFill();
    p.rect(-100, -100, 200, 200);
    p.line(0, -100, 0, 100);
    p.line(-100, 0, 100, 0);

    // Draw vertices
    p.stroke(255, 255, 0);
    p.strokeWeight(4);
    p.noFill();
    const v1 = [25, 100];
    const v2 = [50, 0];
    const v3 = [0, -25];
    const v4 = [-75, 0];
    const v5 = [-25, 100];

    p.point(...v1);
    p.point(...v2);
    p.point(...v3);
    p.point(...v4);
    p.point(...v5);

    const d1 = [20, -20];
    const d2 = [0, -20];
    const d3 = [-10, 5];
    const d4 = [0, 30];
    const d5 = [-10, 20];
    const [f1, b1] = compute_tangent_points(v1, d1);
    const [f2, b2] = compute_tangent_points(v2, d2);
    const [f3, b3] = compute_tangent_points(v3, d3);
    const [f4, b4] = compute_tangent_points(v4, d4);
    const [f5, b5] = compute_tangent_points(v5, d5);
    // Draw control points
    p.stroke(0, 255, 0);
    p.noFill();
    p.point(...f1);
    p.point(...f2);
    p.point(...f3);
    p.point(...f4);
    p.point(...f5);
    p.point(...b1);
    p.point(...b2);
    p.point(...b3);
    p.point(...b4);
    p.point(...b5);

    p.stroke(0, 255, 255);
    p.noFill();
    p.bezier(...v1, ...f1, ...b2, ...v2);
    p.bezier(...v2, ...f2, ...b3, ...v3);
    p.bezier(...v3, ...f3, ...b4, ...v4);
    p.bezier(...v4, ...f4, ...b5, ...v5);

    p.pop();
  };
};
