import { Even, Odd } from "./multivectors";

/**
 *
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean | undefined}
 */
function are_odd_multivectors_equal(a, b) {
  const is_a_odd = a instanceof Odd;
  const is_b_odd = b instanceof Odd;

  if (is_a_odd && is_b_odd) {
    return a.equals(b);
  } else if (is_a_odd === is_b_odd) {
    return undefined;
  } else {
    return false;
  }
}

/**
 *
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean | undefined}
 */
function are_even_multivectors_equal(a, b) {
  const is_a_odd = a instanceof Even;
  const is_b_odd = b instanceof Even;

  if (is_a_odd && is_b_odd) {
    return a.equals(b);
  } else if (is_a_odd === is_b_odd) {
    return undefined;
  } else {
    return false;
  }
}

export const PGA_TESTERS = [
  are_odd_multivectors_equal,
  are_even_multivectors_equal,
];
