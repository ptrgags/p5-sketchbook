import { Circle } from "../primitives/Circle.js";
import { diff_float_property, format_diff } from "./diff_properties.js";

export function diff_circle(diffs, received, expected) {
  if (!(received instanceof Circle)) {
    diffs.push(`expected Circle, got ${received}`);
    return diffs;
  }

  diff_float_property(diffs, received.center, expected.center, "x", "center.x");
  diff_float_property(diffs, received.center, expected.center, "x", "center.y");
  diff_float_property(diffs, received, expected, "radius");
  return diffs;
}

export const GEOMETRY_MATCHERS = {
  toBeCircle(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_circle([], received, expected)),
    };
  },
};
