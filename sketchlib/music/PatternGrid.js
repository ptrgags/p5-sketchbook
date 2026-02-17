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
   * Keep the grid values the same, but scale the step size. This is like
   * stretching/squishing the pattern in time without changing the structure
   * @example
   * // returns PatternGrid([1, 2, 3], 1/2)
   * new PatternGrid([1, 2, 3], new Rational(1, 4)).scale(2);
   * @param {Rational} factor Scale factor to multiply the step size
   * @returns {PatternGrid<T>}
   */
  scale(factor) {
    throw new Error("not implemented");
  }

  /**
   * Subdivid
   * @param {number} factor Positive integer factor for how many times to repeat each element
   * @returns {PatternGrid<T>}
   */
  subdivide(factor) {
    throw new Error("not implemented");
  }

  /**
   * Map a function over each step of the pattern. This is just like Array.map()
   * but for PatternGrids.
   * @template U
   * @param {function(T, number): U} f a function from (x: T, i: number) to some new type U
   * @returns {PatternGrid<U>} New grid with the same size but transformed values
   */
  map(f) {
    return new PatternGrid(this.values.map(f), this.step_size);
  }

  /**
   * Return the empty pattern
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
    const merged_values = a.values.map((x, i) => merge_func(x, b[i]));
    return new PatternGrid(merged_values, a.step_size);
  }
}
