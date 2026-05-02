import { Rational } from "../Rational.js";
import { PatternGrid } from "./PatternGrid.js";
import { Rhythm } from "./Rhythm.js";
import { Sequential } from "./Timeline.js";

/**
 * A Riff is a Rhythm + a number of values
 * @template T
 */
export class Riff {
  /**
   * Constructor
   * @param {Rhythm} rhythm
   * @param {T[]} values
   */
  constructor(rhythm, values) {
    if (values.length !== rhythm.length_beats) {
      throw new Error(
        "values must have the same length as rhythm.length_beats",
      );
    }

    this.rhythm = rhythm;
    this.values = values;
  }

  get length_steps() {
    return this.rhythm.length_steps;
  }

  get length_beats() {
    return this.rhythm.length_beats;
  }

  get duration() {
    return this.rhythm.duration;
  }

  get step_size() {
    return this.rhythm.step_size;
  }

  /**
   * Iterate over the rhythm's beats and zip in the values
   * @returns {Generator<[T, number] | number>} for notes, returns [value, duration]. For rests, returns duration. Durations are integer number of steps
   */
  *beat_iter() {
    let index = 0;
    for (const [is_note, duration_steps] of this.rhythm.beat_iter()) {
      if (is_note) {
        yield [this.values[index], duration_steps];
        index++;
      } else {
        yield duration_steps;
      }
    }
  }

  /**
   * Map the values of the riff to a new type. The rhythm remains the same.
   * @template U
   * @param {function(T, number): U} f A function (x: T, i: number) to some new type U
   * @returns {Riff<U>} The transformed riff
   */
  map(f) {
    return new Riff(this.rhythm, this.values.map(f));
  }

  /**
   * Zip the rhythm with the values to create a timeline.
   * @returns {Sequential<T>}
   */
  to_timeline() {
    return this.rhythm.zip(this.values);
  }

  /**
   * Concat riffs of the same type and step size
   * @template T
   * @param  {...Riff<T>} riffs
   * @returns {Riff<T>}
   */
  static concat(...riffs) {
    const rhythm = Rhythm.concat(...riffs.map((x) => x.rhythm));
    const values = riffs.map((x) => x.values).flat();
    return new Riff(rhythm, values);
  }

  /**
   * Convenience constructor that constructs the Rhythm for you
   * @template U
   * @param {string} rhythm_str
   * @param {U | U[] | PatternGrid<U>} values If values is a constant, it will be repeated for every beat. If it's an array, the values will be sliced to match the number of beats. If it's a PatternGrid, the values will be used, ignoring the step size
   * @param {Rational} step_size
   * @returns {Riff<U>}
   */
  static literal(rhythm_str, values, step_size) {
    const rhythm = new Rhythm(rhythm_str, step_size);

    if (values instanceof PatternGrid) {
      return new Riff(rhythm, values.values);
    } else if (Array.isArray(values)) {
      return new Riff(rhythm, values.slice(0, rhythm.length_beats));
    }

    return new Riff(rhythm, new Array(rhythm.length_beats).fill(values));
  }
}
