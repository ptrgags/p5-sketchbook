import { CEven } from "../cga2d/CEven.js";
import { COdd } from "../cga2d/COdd.js";
import { diff_float_property, format_diff } from "./diff_properties.js";
import { Cline } from "../cga2d/Cline.js";
import { Line } from "../pga2d/Line.js";
import { Circle } from "../primitives/Circle.js";
import { diff_circle } from "./geometry_matchers.js";
import { diff_line, diff_point } from "./pga_matchers.js";
import { NullPoint } from "../cga2d/NullPoint.js";
import { CVersor } from "../cga2d/CVersor.js";

const EVEN_PROPERTIES = ["scalar", "xy", "xp", "xm", "yp", "ym", "pm", "xypm"];
function diff_ceven(diffs, received, expected) {
  if (!(received instanceof CEven)) {
    diffs.push(`expected CEven, got${received}`);
    return diffs;
  }

  for (const property_name of EVEN_PROPERTIES) {
    diff_float_property(diffs, received, expected, property_name);
  }

  return diffs;
}

const ODD_PROPERTIES = ["x", "y", "p", "m", "xyp", "xym", "xpm", "ypm"];

function diff_codd(diffs, received, expected) {
  if (!(received instanceof COdd)) {
    diffs.push(`expected COdd, got ${received}`);
    return diffs;
  }

  for (const property_name of ODD_PROPERTIES) {
    diff_float_property(diffs, received, expected, property_name);
  }

  return diffs;
}

function diff_cversor(diffs, received, expected) {
  if (!(received instanceof CVersor)) {
    diffs.push(`expected CVersor, got ${received}`);
    return diffs;
  }

  if (expected.versor instanceof COdd) {
    diff_codd(diffs, received.versor, expected.versor);
  } else {
    diff_ceven(diffs, received.versor, expected.versor);
  }

  return diffs;
}

export function diff_cline(diffs, received, expected) {
  if (!(received instanceof Cline)) {
    diffs.push(`expected Cline, got ${received}`);
    return diffs;
  }

  diff_codd(diffs, received.vector, expected.vector);

  if (
    received.primitive instanceof Line &&
    expected.primitive instanceof Line
  ) {
    diff_line(diffs, received.primitive, expected.primitive);
  } else if (
    received.primitive instanceof Circle &&
    expected.primitive instanceof Circle
  ) {
    diff_circle(diffs, received.primitive, expected.primitive);
  } else {
    diffs.push(
      `primitives don't match! expected ${expected.primitive}, got ${received.primitive}`,
    );
  }

  return diffs;
}

export function diff_null_point(diffs, received, expected) {
  if (!(received instanceof NullPoint)) {
    diffs.push(`expected NullPoint, got ${received}`);
    return diffs;
  }

  diff_codd(diffs, received.vector, expected.vector);
  diff_point(diffs, received.point, expected.point);

  return diffs;
}

export const CGA_MATCHERS = {
  toBeCEven(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_ceven([], received, expected)),
    };
  },
  toBeCOdd(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_codd([], received, expected)),
    };
  },
  toBeCVersor(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_cversor([], received, expected)),
    };
  },
  toBeCline(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_cline([], received, expected)),
    };
  },
  toBeNullPoint(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_diff(diff_null_point([], received, expected)),
    };
  },
};
