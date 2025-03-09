import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { Point } from "../pga2d/objects.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";

let cp1 = Point.point(100, 240);
let cp2 = Point.point(320, 100);
let cp3 = Point.point(400, 600);

let steps = 10;
let ratio = 1.0 / steps;

function circle(p, x, y, r) {
  p.ellipse(x, y, r, r);
}

function plot(p, point, radius = 3) {
  circle(p, point.x, point.y, radius);
}

function line_between(p, a, b) {
  p.line(a.x, a.y, b.x, b.y);
}

function* bezier_gen(p1, p2, p3, steps, ratio) {
  for (let x = 0; x < steps; x++) {
    const p4 = Point.lerp(p1, p2, ratio * x);
    const p5 = Point.lerp(p2, p3, ratio * x);
    // Curve point
    const p6 = Point.lerp(p4, p5, ratio * x);
    yield [p4, p5, p6];
  }
}

export const sketch = (p) => {
  let canvas;

  p.setup = () => {
    canvas = p.createCanvas(500, 700).elt;
    prevent_mobile_scroll(canvas);
  };

  p.draw = () => {
    p.background(0);
    p.stroke(255, 0, 0);
    p.strokeWeight(4);
    p.noFill();
    p.beginShape();
    p.vertex(cp1.x, cp1.y);
    p.quadraticVertex(cp2.x, cp2.y, cp3.x, cp3.y);
    p.endShape();

    p.stroke(255);
    p.strokeWeight(1);
    plot(p, cp1);
    line_between(p, cp1, cp2);
    plot(p, cp2);
    line_between(p, cp2, cp3);
    plot(p, cp3);

    for (const [p4, p5, p6] of bezier_gen(cp1, cp2, cp3, steps, ratio)) {
      line_between(p, p4, p5);
      plot(p, p6);
    }
  };

  p.mouseDragged = () => {
    cp2 = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
  };

  p.mouseWheel = (event) => {
    steps -= Math.sign(event.delta);
    steps = Math.max(steps, 1);
    ratio = 1.0 / steps;
  };
};
