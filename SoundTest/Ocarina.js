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
  [
    // Left hand
    true,
    true,
    true,
    true,
    true,
    true,
    // right hand
    true,
    true,
    true,
    true,
    true,
    true,
  ],
  // A#4
  [
    // left hand
    true,
    true,
    true,
    true,
    true,
    true,
    // right hand
    true,
    true,
    true,
    true,
    true,
    false,
  ],
  // B4
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right hand
    true,
    true,
    true,
    true,
    true,
    true,
  ],
  // C5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    true,
    true,
    true,
    true,
    true,
    false,
  ],
  // C#5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    true,
    true,
    true,
    false,
    true,
    true,
  ],
  // D5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    true,
    true,
    true,
    false,
    true,
    false,
  ],
  // D#5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    true,
    true,
    false,
    false,
    true,
    true,
  ],
  // E5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    true,
    true,
    false,
    false,
    true,
    false,
  ],
  // F5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    true,
    false,
    false,
    false,
    true,
    false,
  ],
  // F#5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    false,
    false,
    true,
    false,
    true,
    false,
  ],
  // G5
  [
    // left
    true,
    true,
    true,
    true,
    true,
    false,
    // right
    false,
    false,
    false,
    false,
    true,
    false,
  ],
  // G#5
  [
    // left
    true,
    true,
    false,
    true,
    true,
    false,
    // right
    false,
    false,
    true,
    false,
    true,
    false,
  ],
  // A5
  [
    // left
    true,
    true,
    false,
    true,
    true,
    false,
    // right
    false,
    false,
    false,
    false,
    true,
    false,
  ],
  // A#5
  [
    // left
    true,
    false,
    false,
    true,
    true,
    false,
    // right
    false,
    false,
    true,
    false,
    true,
    false,
  ],
  // B5
  [
    // left
    true,
    false,
    false,
    true,
    true,
    false,
    // right
    false,
    false,
    false,
    false,
    true,
    false,
  ],
  // C6
  [
    // left
    false,
    false,
    false,
    true,
    true,
    false,
    // right
    false,
    false,
    false,
    false,
    true,
    false,
  ],
  // C#6
  [
    // left
    false,
    false,
    false,
    true,
    false,
    false,
    // right
    false,
    false,
    true,
    false,
    true,
    false,
  ],
  // D6
  [
    // left
    false,
    false,
    false,
    true,
    false,
    false,
    // right
    false,
    false,
    false,
    false,
    true,
    false,
  ],
  // D#6
  [
    // left
    false,
    false,
    false,
    true,
    false,
    false,
    // right
    false,
    false,
    true,
    false,
    false,
    false,
  ],
  // E6
  [
    // left
    false,
    false,
    false,
    true,
    false,
    false,
    // right
    false,
    false,
    false,
    false,
    false,
    false,
  ],
  // F6
  [
    // left
    false,
    false,
    false,
    false,
    false,
    false,
    // right
    false,
    false,
    false,
    false,
    false,
    false,
  ],
];
