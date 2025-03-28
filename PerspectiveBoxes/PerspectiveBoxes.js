import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Point, Line } from "../pga2d/objects.js";
import {
  GroupPrimitive,
  LinePrimitive,
  PointPrimitive,
  PolygonPrimitive,
} from "../sketchlib/primitives.js";
import { Style, Color } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

/**
 * Vanishing points. The right and left vanishing points are always the equivalent of
 * 90 degrees apart in the 3D scene being portrayed. A vanishing point at 45 degrees
 * is also computed as this is needed for boxes.
 * @typedef {Object} VanishingPoints
 * @property {Point} vp_left The left vanishing point, 90 degrees to the left of the right vanishing point
 * @property {Point} vp_45 The vanishing point at an angle halfway between vp_left and vp_right. Note that due to perspective, this is NOT the midpoint!
 * @property {Point} vp_right The right vanishing point
 */

/**
 * @param {Point} center A Euclidean point for the center of vision
 * @param {number} angle_right From the viewer's perspective in 3D, what is the angle between the center of vision and the right vanishing point?
 * @param {number} distance How far away is the eye from the image plane, measured in pixels
 * @returns {VanishingPoints} The computed vanishing points
 */
function compute_vanishing_points(center, angle_right, distance) {
  // A vanishing point at an angle from the center of vision will appear
  // at d * tan(angle)

  const tan_angle = Math.tan(angle_right);
  const right_offset = distance * tan_angle;
  const left_offset = -distance / tan_angle;
  const vp_right = center.add(Point.DIR_X.scale(right_offset));
  const vp_left = center.add(Point.DIR_X.scale(left_offset));

  // We also need a vanishing point at 45 degrees for setting up an accurate cube
  const offset_45 = distance * Math.tan(angle_right - Math.PI / 4);
  const vp_45 = center.add(Point.DIR_X.scale(offset_45));
  return { vp_left, vp_right, vp_45 };
}

/**
 * The corners of the cube, labeled by which basis vectors you add to reach
 * that point
 * @typedef {Object} CubeCorners
 */

/**
 * The edges of the cube, labeled by which points they connect. The edges
 * are oriented away from the origin
 * @typedef {Object} CubeEdges
 */

/**
 * @typedef {Object} PerspectiveCube
 * @property {CubeCorners} corners
 * @property {CubeEdges} edges
 */

/**
 * Compute a perspective drawing of a cube
 * @param {VanishingPoints} vanishing_points
 * @param {Point} xy The bottom corner closest to the viewer, in screen pixels. This anchors the entire cube
 * @param {number} height_xyz The height of the corner opposite from the corner (xyz) over the corner below it (xy). This is given in pixels in the image plane
 * @param {number} percent_x How far along the line from the left vanishing point to (xy)
 * @return {PerspectiveCube} The
 */
function compute_cube(vanishing_points, xy, height_xyz, percent_x) {
  const { vp_left, vp_right, vp_45 } = vanishing_points;
  const vp_up = Point.DIR_Y.scale(-1);

  // To bootstrap the process, we need to find xyz, the point diagonally opposite
  // the origin, and x, the corner along the x-axis. These are done with the
  // dimensions passed in.
  const xyz = xy.add(Point.DIR_Y.scale(-height_xyz));
  const x = Point.lerp(vp_left, xy, percent_x);

  // Compute the origin by intersecting two lines
  const line_o_x = vp_right.join(x);
  const diag_xy = xy.join(vp_45);
  const o = line_o_x.meet(diag_xy);

  // compute the corner on the y-axis
  const line_o_y = vp_left.join(o);
  const line_y_xy = vp_right.join(xy);
  const y = line_o_y.meet(line_y_xy);

  // Compute the corner on the z-axis
  const line_o_z = o.join(vp_up);
  const diag_xyz = xyz.join(vp_45);
  const z = line_o_z.meet(diag_xyz);

  // Compute the remaining corners
  const line_x_xz = x.join(vp_up);
  const line_z_xz = vp_right.join(z);
  const xz = line_x_xz.meet(line_z_xz);

  const line_y_yz = y.join(vp_up);
  const line_z_yz = vp_left.join(z);
  const yz = line_y_yz.meet(line_z_yz);

  // and the last lines
  const line_x_xy = x.join(xy);
  const line_yz_xyz = yz.join(xyz);
  const line_xy_xyz = xy.join(xyz);
  const line_xz_xyz = xz.join(xyz);

  return {
    corners: {
      o,
      x,
      y,
      z,
      xy,
      xz,
      yz,
      xyz,
    },
    edges: {
      line_o_x,
      line_o_y,
      line_o_z,
      line_x_xy,
      line_x_xz,
      line_y_xy,
      line_y_yz,
      line_z_xz,
      line_z_yz,
      line_xy_xyz,
      line_xz_xyz,
      line_yz_xyz,
    },
  };
}

function render_axes(cube) {
  const { o, x, y, z } = cube.corners;
  const x_axis = new GroupPrimitive(
    [new LinePrimitive(o, x)],
    Style.from_color(Color.RED).with_width(2)
  );

  const y_axis = new GroupPrimitive(
    [new LinePrimitive(o, y)],
    Style.from_color(Color.GREEN).with_width(2)
  );

  const z_axis = new GroupPrimitive(
    [new LinePrimitive(o, z)],
    Style.from_color(Color.BLUE).with_width(2)
  );

  return new GroupPrimitive([x_axis, y_axis, z_axis]);
}

function render_corners(cube) {
  const values = Object.values(cube.corners);
  const points = values.map((x) => new PointPrimitive(x));
  return new GroupPrimitive(points, new Style().with_fill(Color.WHITE));
}

function render_edges(cube) {
  const { o, x, y, z, xy, xz, yz, xyz } = cube.corners;

  const lines = [
    [o, x],
    [o, y],
    [o, z],
    [x, xz],
    [x, xy],
    [y, xy],
    [y, yz],
    [z, xz],
    [z, yz],
    [xy, xyz],
    [xz, xyz],
    [yz, xyz],
  ].map(([a, b]) => new LinePrimitive(a, b));

  return new GroupPrimitive(lines, new Style().with_stroke(Color.WHITE));
}

const ANGLE = Math.PI / 3; // Math.PI / 6;
const DISTANCE = 400;
const CENTER = Point.point(WIDTH / 2, HEIGHT / 2);

// bottom front corner of the cube
const POINT_XY = Point.point(WIDTH / 5, (7 * HEIGHT) / 8);
// Height from bottom front corner to top front corner
const HEIGHT_XYZ = 600;
// Follow the line to the left vanishing point by some percentage to
// place the x-axis
const PERCENT_X = 0.4;
const VANISHING_POINTS = compute_vanishing_points(CENTER, ANGLE, DISTANCE);
const CUBE = compute_cube(VANISHING_POINTS, POINT_XY, HEIGHT_XYZ, PERCENT_X);

const VPS = new GroupPrimitive(
  Object.values(VANISHING_POINTS).map((x) => new PointPrimitive(x)),
  Style.from_color(Color.RED)
);
const CORNERS = render_corners(CUBE);
const EDGES = render_edges(CUBE);
const AXES = render_axes(CUBE);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
    p.background(0);

    draw_primitive(p, VPS);
    draw_primitive(p, EDGES);
    draw_primitive(p, CORNERS);
    draw_primitive(p, AXES);
  };
};
