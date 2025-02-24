import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Point } from "../pga2d/objects.js";
import {
  GroupPrimitive,
  LinePrimitive,
  PointPrimitive,
  PolygonPrimitive,
} from "../sketchlib/primitives.js";
import { Style, Color } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

const ANGLE = Math.PI / 3;
const TAN_ANGLE = Math.tan(ANGLE);
const DISTANCE = 400;

// Right vanishing point is infinity in the -x direction
const VP_RIGHT = Point.point(WIDTH / 2 + DISTANCE * TAN_ANGLE, HEIGHT / 2);

// Left vanishing point is infinity in the -y direction
const VP_LEFT = Point.point(WIDTH / 2 + -DISTANCE / TAN_ANGLE, HEIGHT / 2);

// We also need a vanishing point at 45 degrees to make sure we draw a cube
const VP_45 = Point.point(
  WIDTH / 2 + DISTANCE * Math.tan(ANGLE - Math.PI / 4),
  HEIGHT / 2
);

const STYLE_VP = new Style().with_fill(Color.WHITE).with_stroke(Color.WHITE);

// Create a cube with one edge pointing toward the camera

// bottom front corner of the cube
const FRONT = Point.point(WIDTH / 5, (3 * HEIGHT) / 4);

// Height from bottom front corner to top front corner
const HEIGHT_FRONT = 500;
const TOP = FRONT.add(Point.direction(0, -HEIGHT_FRONT));

// Follow the line to the left vanishing point by some percentage to
// place the x-axis
const X_PERCENT = 0.6;
const POINT_X = Point.lerp(FRONT, VP_LEFT, X_PERCENT);

// Use the vanishing points to find the origin and the other ends of the axes
const ORIGIN = POINT_X.join(VP_RIGHT).meet(FRONT.join(VP_45));
const POINT_Y = VP_LEFT.join(ORIGIN).meet(FRONT.join(VP_RIGHT));
const DIRECTION_UP = Point.direction(0, -1);
const POINT_Z = TOP.join(VP_45).meet(ORIGIN.join(DIRECTION_UP));

// Find the last 2 points to complete the cube
const POINT_XZ = POINT_Z.join(VP_RIGHT).meet(POINT_X.join(DIRECTION_UP));
const POINT_YZ = POINT_Y.join(DIRECTION_UP).meet(POINT_Z.join(VP_LEFT));

const POINTS = new GroupPrimitive(
  [
    new PointPrimitive(VP_RIGHT),
    new PointPrimitive(VP_LEFT),
    new PointPrimitive(VP_45),
    new PointPrimitive(TOP),
    new LinePrimitive(POINT_XZ, POINT_X),
    new LinePrimitive(POINT_XZ, POINT_Z),
    new LinePrimitive(FRONT, POINT_X),
    new LinePrimitive(FRONT, POINT_Y),
    new LinePrimitive(POINT_YZ, POINT_Y),
    new LinePrimitive(POINT_YZ, POINT_Z),
  ],
  STYLE_VP
);

const X_AXIS = new GroupPrimitive(
  [new LinePrimitive(ORIGIN, POINT_X)],
  Style.from_color(Color.RED).with_width(2)
);

const Y_AXIS = new GroupPrimitive(
  [new LinePrimitive(ORIGIN, POINT_Y)],
  Style.from_color(Color.GREEN).with_width(2)
);

const Z_AXIS = new GroupPrimitive(
  [new LinePrimitive(ORIGIN, POINT_Z)],
  Style.from_color(Color.BLUE).with_width(2)
);

const AXES = new GroupPrimitive([X_AXIS, Y_AXIS, Z_AXIS]);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
    p.background(0);

    draw_primitive(p, POINTS);
    draw_primitive(p, AXES);
  };
};
