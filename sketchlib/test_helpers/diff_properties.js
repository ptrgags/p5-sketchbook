import { is_nearly } from "../is_nearly.js";

/**
 * Diff a property of two objects for jest matchers,
 * adding an error message to the diffs if the property doesn't match
 * @param {string[]} diffs Array of diff messages to update
 * @param {object} received Received object
 * @param {object} expected Expected object
 * @param {string} property_name Property to compare
 */
export function diff_property(diffs, received, expected, property_name) {
  const received_value = received[property_name];
  const expected_value = expected[property_name];
  if (received_value !== expected_value) {
    diffs.push(`${property_name}: ${received_value} !== ${expected_value}`);
  }
}

/**
 * Like diff_property, but uses is_nearly for float comparisons
 * @param {string[]} diffs Array of diff messages to update
 * @param {object} received Received object
 * @param {object} expected Expected object
 * @param {string} property_name Property to compare
 * @param {string} [label] Label to use for formatting if different than label
 */
export function diff_float_property(
  diffs,
  received,
  expected,
  property_name,
  label,
) {
  const received_value = received[property_name];
  const expected_value = expected[property_name];

  label = label ?? property_name;
  if (!is_nearly(received_value, expected_value)) {
    diffs.push(`${label}: !is_nearly(${received_value}, ${expected_value})`);
  }
}

/**
 * Format diffs for test helpers
 * @param {string[]} diffs Diff error messages
 * @returns {string} Formatted diff string
 */
export function format_diff(diffs) {
  const diff_lines = diffs.join("\n");
  return `Actual | Expected\n${diff_lines}`;
}
