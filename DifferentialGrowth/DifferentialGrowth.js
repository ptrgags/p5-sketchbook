import { Rectangle } from "./rectangle.js";
import { Quadtree } from "./quadtree.js";
import { DifferentialPolyline } from "./DifferentialPolyline.js";
import { Color, Style } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

const WIDTH = 500;
const HEIGHT = 700;
const BOUNDS = new Rectangle(0, 0, WIDTH, HEIGHT);
const QUADTREE = new Quadtree(BOUNDS);

const points = [];
const points2 = [];
const INITIAL_POINTS = 20;
const OFFSET = HEIGHT / 12;
for (let i = 0; i < INITIAL_POINTS; i++) {
  const angle = (2.0 * Math.PI * i) / INITIAL_POINTS;
  const x = WIDTH / 2 + 50 * Math.cos(angle);
  const y = HEIGHT / 2 + 50 * Math.sin(angle);
  points.push([x, y - OFFSET]);
  points2.push([x, y + OFFSET]);
}

const POLYLINE = new DifferentialPolyline(points, QUADTREE);
const POLYLINE2 = new DifferentialPolyline(points2, QUADTREE);

const BASE_STYLE = new Style().with_stroke(new Color(0, 0, 0)).with_width(2);
const STYLE_POLYLINE1 = BASE_STYLE.with_fill(new Color(255, 127, 0));
const STYLE_POLYLINE2 = BASE_STYLE.with_fill(new Color(0, 127, 0));

// How many calls to update() per frame
const UPDATES_PER_FRAME = 4;

// How much simulation time elapses ever call to update()
const DELTA_TIME = 0.05;

// How many time steps between
const SPLIT_LONG_PERIOD = 1;

// How many time steps between growing the curve by one point. This does not
const GROWTH_PERIOD = 200;

// How many time steps between adding points where the curve has become too sharp
const SPLIT_PINCHED_PERIOD = 100;

export const sketch = (p) => {
  let show_ref_geometry = false;
  let simulation_step = 0;
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    p.background(128);

    document.getElementById("toggle-ref-geom").addEventListener("click", () => {
      show_ref_geometry = !show_ref_geometry;
    });
  };

  function update() {
    simulation_step++;

    POLYLINE.update(DELTA_TIME);
    POLYLINE2.update(DELTA_TIME);
    const results = QUADTREE.redistribute_dirty_points();
    if (results.length > 0) {
      throw new Error("DIRTY POINTS", results);
    }

    if (simulation_step % GROWTH_PERIOD == 0) {
      POLYLINE.add_random_point();
      POLYLINE2.add_random_point();
    }

    if (simulation_step % SPLIT_LONG_PERIOD === 0) {
      POLYLINE.split_long_edges();
      POLYLINE2.split_long_edges();
    }

    if (simulation_step % SPLIT_PINCHED_PERIOD === 0) {
      POLYLINE.split_pinched_angles();
      POLYLINE2.split_pinched_angles();
    }
  }

  p.draw = () => {
    p.background(128);

    if (show_ref_geometry) {
      QUADTREE.draw(p);
    }

    if (show_ref_geometry) {
      const poly1 = POLYLINE.make_polyline(
        STYLE_POLYLINE1.with_stroke(new Color(255, 255, 255))
      );
      const poly2 = POLYLINE2.make_polyline(
        STYLE_POLYLINE2.with_stroke(new Color(255, 255, 255))
      );
      draw_primitive(p, poly1);
      draw_primitive(p, poly2);
    }

    const spline1 = POLYLINE.make_curve(STYLE_POLYLINE1);
    const spline2 = POLYLINE2.make_curve(STYLE_POLYLINE2);
    draw_primitive(p, spline1);
    draw_primitive(p, spline2);

    for (let i = 0; i < UPDATES_PER_FRAME; i++) {
      update();
    }
  };
};
