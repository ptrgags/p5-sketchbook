import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { CirclePrimitive } from "../../sketchlib/primitives/CirclePrimitive.js";

// Node letter labels refer to the concept art diagram
const RADIUS_BIG = 25;
const RADIUS_SMALL = RADIUS_BIG / 2;

export const CIRCLE_A = CirclePrimitive.from_two_points(
  new Point(-75, 600),
  new Point(0, 600)
);
export const CIRCLE_B = new CirclePrimitive(new Point(50, 600), RADIUS_BIG);
export const CIRCLE_C = CirclePrimitive.from_two_points(
  new Point(50, 675),
  new Point(75, 650)
);
export const CIRCLE_D = CirclePrimitive.from_two_points(
  new Point(100, 550),
  new Point(125, 550)
);
export const CIRCLE_E = CirclePrimitive.from_two_points(
  // tweaked a bit from diagram
  new Point(150, 600).add(new Direction(25, 0)),
  new Point(175, 550).add(new Direction(25, 0))
);
export const CIRCLE_F = CirclePrimitive.from_two_points(
  new Point(150, 500),
  new Point(100, 475)
);
// Adjusted slightly from diagram
export const CIRCLE_G = new CirclePrimitive(new Point(175, 375), RADIUS_SMALL);
export const CIRCLE_H = new CirclePrimitive(new Point(225, 325), RADIUS_BIG);
export const CIRCLE_I = new CirclePrimitive(new Point(125, 400), RADIUS_SMALL);
export const CIRCLE_J = CirclePrimitive.from_two_points(
  new Point(125, 325),
  new Point(125, 350)
);
export const CIRCLE_K = new CirclePrimitive(new Point(125, 275), RADIUS_BIG);
export const CIRCLE_L = new CirclePrimitive(new Point(75, 250), RADIUS_BIG);
export const CIRCLE_M = CirclePrimitive.from_two_points(
  new Point(75, 400),
  new Point(75, 425)
);
export const CIRCLE_N = new CirclePrimitive(new Point(50, 350), RADIUS_BIG);
export const CIRCLE_O = CirclePrimitive.from_two_points(
  new Point(50, 525),
  new Point(50, 550)
);
export const CIRCLE_P = new CirclePrimitive(new Point(25, 425), RADIUS_BIG);

export const ALL_CIRCLES = [
  CIRCLE_A,
  CIRCLE_B,
  CIRCLE_C,
  CIRCLE_D,
  CIRCLE_E,
  CIRCLE_F,
  CIRCLE_G,
  CIRCLE_H,
  CIRCLE_I,
  CIRCLE_J,
  CIRCLE_K,
  CIRCLE_L,
  CIRCLE_M,
  CIRCLE_N,
  CIRCLE_O,
  CIRCLE_P,
];
