import { ArcAngles } from "../ArcAngles.js";
import { ArcPrimitive } from "../primitives/ArcPrimitive.js";
import { Circle } from "../primitives/Circle.js";
import { LineSegment } from "../primitives/LineSegment.js";
import { Ray } from "../primitives/Ray.js";
import { diff_float_property, format_diff } from "./diff_properties.js";
import { diff_dir, diff_point } from "./pga_matchers.js";

export function diff_circle(diffs, received, expected) {
  if (!(received instanceof Circle)) {
    diffs.push(`expected Circle, got ${received}`);
    return diffs;
  }

  diff_point(diffs, received.center, expected.center);
  diff_float_property(diffs, received, expected, "radius");
  return diffs;
}

export function diff_line_segment(diffs, received, expected) {
  if (!(received instanceof LineSegment)) {
    diffs.push(`expected LineSegment, got ${received}`);
    return diffs;
  }

  diffs.push("start point:");
  diff_point(diffs, received.a, expected.a);
  diffs.push("end point:");
  diff_point(diffs, received.b, expected.b);

  return diffs;
}

export function diff_ray(diffs, received, expected) {
  if (!(received instanceof Ray)) {
    diffs.push(`expected Ray, got ${received}`);
    return diffs;
  }

  diffs.push("start:");
  diff_point(diffs, received.start, expected.start);
  diffs.push("direction:");
  diff_dir(diffs, received.direction, expected.direction);

  return diffs;
}

export function diff_angles(diffs, received, expected) {
  if (!(received instanceof ArcAngles)) {
    diffs.push(`expected ArcAngles, got ${received}`);
    return diffs;
  }

  diff_float_property(diffs, received, expected, "start_angle");
  diff_float_property(diffs, received, expected, "end_angle");

  return diffs;
}

export function diff_arc(diffs, received, expected) {
  if (!(received instanceof ArcPrimitive)) {
    diffs.push(`expected ArcPrimitive, got ${received}`);
    return diffs;
  }

  diff_point(diffs, received.center, expected.center);
  diff_float_property(diffs, received, expected, "radius");
  diff_angles(diffs, received.angles, expected.angles);

  return diffs;
}

export const GEOMETRY_MATCHERS = {
  toBeCircle(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_circle([], received, expected)),
    };
  },
  toBeLineSegment(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_line_segment([], received, expected)),
    };
  },
  toBeRay(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_ray([], received, expected)),
    };
  },
  toBeArcAngles(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_angles([], received, expected)),
    };
  },
  toBeArc(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_arc([], received, expected)),
    };
  },
};
