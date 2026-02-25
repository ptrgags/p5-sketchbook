import {
  diff_float_property,
  diff_property,
  format_diff,
} from "./diff_properties.js";
import { Direction } from "../pga2d/Direction.js";
import { Line } from "../pga2d/Line.js";
import { Even, Odd } from "../pga2d/multivectors.js";
import { Point } from "../pga2d/Point.js";

export function diff_even(diffs, received, expected) {
  if (!(received instanceof Even)) {
    diffs.push(`received is not an Even object: ${received}`);
    return diffs;
  }

  diff_float_property(diffs, received, expected, "scalar", "scalar");
  diff_float_property(diffs, received, expected, "yo", "yo");
  diff_float_property(diffs, received, expected, "xo", "xo");
  diff_float_property(diffs, received, expected, "xy", "xy");

  return diffs;
}

export function diff_odd(diffs, received, expected) {
  if (!(received instanceof Odd)) {
    diffs.push(`received is not an Odd object: ${received}`);
    return diffs;
  }

  diff_float_property(diffs, received, expected, "x", "x");
  diff_float_property(diffs, received, expected, "y", "y");
  diff_float_property(diffs, received, expected, "o", "o");
  diff_float_property(diffs, received, expected, "xyo", "xyo");

  return diffs;
}

export function diff_point(diffs, received, expected) {
  if (!(received instanceof Point)) {
    diffs.push(`recieved is not a Point object: ${received}`);
    return diffs;
  }

  diff_property(diffs, received, expected, "is_direction");
  const r_bivec = received.bivec;
  const e_bivec = expected.bivec;
  diff_float_property(diffs, r_bivec, e_bivec, "yo", "x");
  diff_float_property(diffs, r_bivec, e_bivec, "xo", "-y");
  diff_float_property(diffs, r_bivec, e_bivec, "xy", "weight");

  return diffs;
}

export function diff_dir(diffs, received, expected) {
  if (!(received instanceof Direction)) {
    diffs.push(`recieved is not a Direction object: ${received}`);
    return diffs;
  }

  diff_property(diffs, received, expected, "is_direction");
  const r_bivec = received.bivec;
  const e_bivec = expected.bivec;
  diff_float_property(diffs, r_bivec, e_bivec, "yo", "x");
  diff_float_property(diffs, r_bivec, e_bivec, "xo", "-y");
  diff_float_property(diffs, r_bivec, e_bivec, "xy", "weight");

  return diffs;
}

export function diff_line(diffs, received, expected) {
  if (!(received instanceof Line)) {
    diffs.push(`recieved is not a Line object: ${received}`);
    return diffs;
  }

  diff_property(diffs, received, expected, "is_infinite");
  const r_vec = received.vec;
  const e_vec = expected.vec;
  diff_float_property(diffs, r_vec, e_vec, "x");
  diff_float_property(diffs, r_vec, e_vec, "y");
  diff_float_property(diffs, r_vec, e_vec, "o");

  return diffs;
}

export const PGA_MATCHERS = {
  toBePoint(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_point([], received, expected)),
    };
  },
  toBeDirection(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_dir([], received, expected)),
    };
  },
  toBeLine(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_line([], received, expected)),
    };
  },
  toBeEven(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_even([], received, expected)),
    };
  },
  toBeOdd(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_odd([], received, expected)),
    };
  },
};
