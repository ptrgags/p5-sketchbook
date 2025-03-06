import { is_nearly } from "../sketchlib/is_nearly";
import { Even } from "./multivectors";
import { Point, Line } from "./objects";

function diff_property(diffs, received, expected, property_name) {
  const received_value = received[property_name];
  const expected_value = expected[property_name];
  if (received_value !== expected_value) {
    diffs.push(`${property_name}: ${received_value} !== ${expected_value}`);
  }
}

function diff_float_property(diffs, received, expected, property_name, label) {
  const received_value = received[property_name];
  const expected_value = expected[property_name];

  label = label ?? property_name;
  if (!is_nearly(received_value, expected_value)) {
    diffs.push(`${label}: !is_nearly(${received_value}, ${expected_value})`);
  }
}

function format_even_diff(diffs, received, expected) {
  if (!(received instanceof Even)) {
    return `received is not an Even object: ${received}`;
  }

  diff_float_property(diffs, received, expected, "scalar", "scalar");
  diff_float_property(diffs, received, expected, "yo", "yo");
  diff_float_property(diffs, received, expected, "xo", "xo");
  diff_float_property(diffs, received, expected, "xy", "xy");

  return "actual | expected\n" + diffs.join("\n");
}

function format_odd_diff(diffs, received, expected) {
  if (!(received instanceof Even)) {
    return `received is not an Even object: ${received}`;
  }

  diff_float_property(diffs, received, expected, "x", "x");
  diff_float_property(diffs, received, expected, "y", "y");
  diff_float_property(diffs, received, expected, "o", "o");
  diff_float_property(diffs, received, expected, "xyo", "xyo");

  return "actual | expected\n" + diffs.join("\n");
}

function format_point_diff(received, expected) {
  if (!(received instanceof Point)) {
    return `recieved is not a Point object: ${received}`;
  }

  const diffs = [];

  diff_property(diffs, received, expected, "is_direction");
  const r_bivec = received.bivec;
  const e_bivec = expected.bivec;
  diff_float_property(diffs, r_bivec, e_bivec, "yo", "x");
  diff_float_property(diffs, r_bivec, e_bivec, "xo", "y");
  diff_float_property(diffs, r_bivec, e_bivec, "xy", "weight");

  return "actual | expected\n" + diffs.join("\n");
}

function format_line_diff(received, expected) {
  if (!(received instanceof Line)) {
    return `recieved is not a Line object: ${received}`;
  }

  const diffs = [];

  diff_property(diffs, received, expected, "is_infinite");
  const r_vec = received.vec;
  const e_vec = expected.vec;
  diff_float_property(diffs, r_vec, e_vec, "x");
  diff_float_property(diffs, r_vec, e_vec, "y");
  diff_float_property(diffs, r_vec, e_vec, "o");

  return "actual | expected\n" + diffs.join("\n");
}

export const PGA_MATCHERS = {
  toBePoint(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_point_diff(received, expected),
    };
  },
  toBeLine(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_line_diff(received, expected),
    };
  },
  toBeEven(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_even_diff(received, expected),
    };
  },
  toBeOdd(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_odd_diff(received, expected),
    };
  },
};
