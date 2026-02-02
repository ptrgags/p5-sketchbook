import { Rational } from "../Rational.js";
import { Note, Rest } from "./Music.js";
import { RhythmStep } from "./RhythmStep.js";

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

  get duration() {
    return this.step_size.mul(new Rational(this.values.length));
  }

  /**
   *
   * @param {string} rhythm_str
   * @param {Rational} step_size
   * @returns {PatternGrid<RhythmStep>}
   */
  static rhythm(rhythm_str, step_size) {
    /**
     * @type {RhythmStep[]}
     */
    const values = [];
    for (const c of rhythm_str) {
      if (
        c === RhythmStep.HIT ||
        c === RhythmStep.REST ||
        c === RhythmStep.SUSTAIN
      ) {
        values.push(c);
      } else {
        throw new Error(`invalid rhythm, ${rhythm_str}`);
      }
    }
    return new PatternGrid(values, step_size);
  }

  /**
   * Zip the beats of a rhythm together with
   * @param {PatternGrid<RhythmStep>} rhythm The rhythm to determine the length of notes
   * @param {PatternGrid<number>} pitches The pitches. There must be at least one for every beat of the rhythm. The step size of the grid is ignored.
   * @param {PatternGrid<number>} [velocities] Optional grid of velocity values. If omitted, everything will be mezzo-forte. The step size of this grid is ignored
   * @returns {import("./Timeline.js").Timeline<Note<number>>}
   */
  static zip(rhythm, pitches, velocities) {
    return Rest.ZERO;
  }
}
