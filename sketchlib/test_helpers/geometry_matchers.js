import { Circle } from "../primitives/Circle.js";
import { diff_float_property } from "./diff_properties.js";

function format_circle_diff(received, expected) {
  if (!(received instanceof Circle)) {
    return `received is not a Circle object: ${received}`;
  }

  const diffs = [];
  diff_float_property(diffs, received.center, expected.center, "x", "center.x");
  diff_float_property(diffs, received.center, expected.center, "x", "center.y");
  diff_float_property(diffs, received, expected, "radius");

  return "actual | expected\n" + diffs.join("\n");
}

export const GEOMETRY_MATCHERS = {
  toBeCircle(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_circle_diff(received, expected),
    };
  },
};
