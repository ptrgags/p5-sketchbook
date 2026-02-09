import { CEven } from "../cga2d/CEven.js";
import { COdd } from "../cga2d/COdd.js";
import { diff_float_property } from "./diff_properties.js";

const EVEN_PROPERTIES = ["scalar", "xy", "xp", "xm", "yp", "ym", "pm", "xypm"];
function format_ceven_diff(received, expected) {
  if (!(received instanceof CEven)) {
    return `received is not a CEven object: ${received}`;
  }

  const diffs = [];

  for (const property_name of EVEN_PROPERTIES) {
    diff_float_property(diffs, received, expected, property_name);
  }

  return "actual | expected\n" + diffs.join("\n");
}

const ODD_PROPERTIES = ["x", "y", "p", "m", "xyp", "xym", "xpm", "ypm"];

function format_codd_diff(received, expected) {
  if (!(received instanceof COdd)) {
    return `received is not a COdd object: ${received}`;
  }

  const diffs = [];

  for (const property_name of ODD_PROPERTIES) {
    diff_float_property(diffs, received, expected, property_name);
  }

  return "actual | expected\n" + diffs.join("\n");
}

export const CGA_MATCHERS = {
  toBeCEven(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_ceven_diff(received, expected),
    };
  },
  toBeCOdd(received, expected) {
    return {
      pass: received.equals(expected),
      message: () => format_codd_diff(received, expected),
    };
  },
};
