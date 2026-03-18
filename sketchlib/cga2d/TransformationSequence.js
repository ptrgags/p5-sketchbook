import { whole_fract } from "../whole_fract.js";
import { CVersor } from "./CVersor.js";
import { clamp } from "../clamp.js";

/**
 * Compose transformations together like a cumulative sum, though this
 * starts at identity
 * @param {CVersor[]} transforms Transformations [a, b, c, ..., z]
 * @returns {CVersor[]} Transformations [I, a, ba, cba, ..., z...cba]
 */
function cumulative_compose(transforms) {
  const result = new Array(transforms.length);

  let current_transform = CVersor.IDENTITY;
  for (let i = 0; i < transforms.length; i++) {
    result[i] = current_transform;
    current_transform = transforms[i].compose(current_transform);
  }

  return result;
}

export class TransformationSequence {
  /**
   * Constructor
   * @param {(function(number): CVersor)[]} transform_steps Functions from [0, 1] -> CVersor for the different animation steps. f(0) should return identity, and f(1) should return the desired step
   */
  constructor(transform_steps) {
    this.transform_steps = transform_steps;
    this.transforms = transform_steps.map((f) => f(1));
    this.history = cumulative_compose(this.transforms);
  }

  /**
   * Get the value at
   * @param {number} time Time value in [0, 1]
   */
  value(time) {
    time = clamp(time, 0, 1);
    const [index, t] = whole_fract(this.transform_steps.length * time);

    let interpolated_transform;
    let history_transform;
    if (index === this.transform_steps.length) {
      // corner case where time === 1, return the last value
      interpolated_transform = this.transform_steps.at(-1)(1);
      history_transform = this.history.at(-1);
    } else {
      interpolated_transform = this.transform_steps[index](t);
      history_transform = this.history[index];
    }

    return interpolated_transform.compose(history_transform);
  }
}
