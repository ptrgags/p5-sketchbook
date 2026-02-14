import { Circle } from "../DifferentialGrowth/circle.js";
import { Point } from "../sketchlib/pga2d/Point.js";

const RADIUS_BIG = 0.2;
const RADIUS_SMALL = 0.1;

const FINGER_HOLES_UV = [
  // four main finger holes for left hand
  new Circle(new Point(0, 0), RADIUS_BIG),
  new Circle(new Point(0, 0), RADIUS_BIG),
  new Circle(new Point(0, 0), RADIUS_BIG),
  new Circle(new Point(0, 0), RADIUS_BIG),
  // left thumb
  new Circle(new Point(0, 0), RADIUS_BIG),
  // secondary hole on left finger
  new Circle(new Point(0, 0), RADIUS_SMALL),
  // four main finger holes on right hand
  new Circle(new Point(0, 0), RADIUS_BIG),
  new Circle(new Point(0, 0), RADIUS_BIG),
  new Circle(new Point(0, 0), RADIUS_BIG),
  new Circle(new Point(0, 0), RADIUS_BIG),
  // right thumb
  new Circle(new Point(0, 0), RADIUS_BIG),
  // secondary hole on right finger
  new Circle(new Point(0, 0), RADIUS_SMALL),
];

// fingers are listed in the same order as abov
// For the fingering chart, see the 12-hole C Major ocarina fingering chart
// from STL Ocarina: https://www.stlocarina.com/pages/booklets?srsltid=AfmBOoqSZUzzSybXV95E4o_T4V_GTsT8Uh8lGWtOuwd5q72eexJYpk4e
//
// Chart is based on C ocarinas
// Tenor ocarina range: [A4, F6]
// sporano ocarina range: [A5, F7]
const FINGERING_CHART = [
  // A4
  "111111|111111",
  // A#4
  "111111|111110",
  // B4
  "111110|111111",
  // C5
  "111110|111110",
  // C#5
  "111110|111011",
  // D5
  "111110|111010",
  // D#5
  "111110|110011",
  // E5
  "111110|110010",
  // F5
  "111110|100010",
  // F#5
  "111110|001010",
  // G5
  "111110|000010",
  // G#5
  "110110|001010",
  // A5
  "110110|000010",
  // A#5
  "100110|001010",
  // B5
  "100110|000010",
  // C6
  "000110|000010",
  // C#6
  "000100|001010",
  // D6
  "000100|000010",
  // D#6
  "000100|001000",
  // E6
  "000100|000000",
  // F6
  "000000|000000",
];
