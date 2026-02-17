import { lcm } from "../gcd.js";
import { Rational } from "../Rational.js";
import { flatten_timeline } from "./flatten_timeline.js";
import { make_note, Melody, Note, Rest } from "./Music.js";
import { RelTimelineOps } from "./RelTimelineOps.js";
import { RhythmStep } from "./RhythmStep.js";
import { Velocity } from "./Velocity.js";

/**
 * Compute the smallest subdivision, i.e. the largest denominator in all of the
 * duration values
 * @param {import("./Music.js").Music<number>} melody
 * @return {Rational} denominator value
 */
function compute_subdivision(melody) {
  let subdivision = 1;
  for (const note_or_rest of RelTimelineOps.iter_with_gaps(melody)) {
    subdivision = lcm(subdivision, note_or_rest.duration.denominator);
  }

  return new Rational(1, subdivision);
}

/**
 * @template T
 */
export class PatternGrid {
  /**
   * Constructor
   * @param {T[]} values Values for each step
   * @param {Rational} step_size The size of each step. E.g. 1/4 for quarter notes
   */
  constructor(values, step_size) {
    this.values = values;
    this.step_size = step_size;
  }

  *[Symbol.iterator]() {
    yield* this.values;
  }

  get length() {
    return this.values.length;
  }

  get duration() {
    return this.step_size.mul(new Rational(this.values.length));
  }

  /**
   * @template T
   * @returns {PatternGrid<T>}
   */
  static empty() {
    return new PatternGrid([], Rational.ONE);
  }

  /**
   * Take two patterns and merge them together
   * @template A
   * @template B
   * @template C
   * @param {PatternGrid<A>} a
   * @param {PatternGrid<B>} b
   * @param {function(A, B): C} merge_func
   * @returns {PatternGrid<C>}
   */
  static merge(a, b, merge_func) {
    return PatternGrid.empty();
  }
}
