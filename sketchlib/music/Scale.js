import { range } from "../range.js";
import { Rational } from "../Rational.js";
import { ChordQuality } from "./Chord.js";
import { IntervalStack, PitchClassStack, PitchStack } from "./IntervalStack.js";
import { PatternGrid } from "./PatternGrid.js";

/**
 * Measure intervals from the first value
 * @param {number[]} values
 * @return {number[]}
 */
function from_root(values) {
  return values.map((x) => x - values[0]);
}

export class ScaleQuality {
  /**
   * Constructor
   * @param {number[]} intervals
   */
  constructor(intervals) {
    this.intervals = new IntervalStack(intervals);
  }

  get length() {
    return this.intervals.intervals.length;
  }

  /**
   * Compute a mode of a scale by starting at the specified place
   * in the list.
   * E.g. MAJOR_SCALE.mode(1) is the same as DORIAN_SCALE
   * @param {number} start_index What interval to start the new scale at. This must be in [0, length)
   * @returns {ScaleQuality}
   */
  mode(start_index) {
    if (start_index < 0 || this.length <= start_index) {
      throw new Error(
        `start_index must be an integer in [0, ${this.length - 1}]`,
      );
    }

    const abs_intervals = [...range(this.length)].map((i) =>
      this.intervals.value(start_index + i),
    );
    const rel_intervals = from_root(abs_intervals);

    return new ScaleQuality(rel_intervals);
  }

  /**
   * Stack thirds at each position of the scale to get
   * the corresponding chords.
   * @param {number} n How many thirds to stack. E.g. 3 for triads, 4 for seventh chords
   * @returns {ChordQuality[]} A chord quality for each position in the scale.
   */
  stack_thirds(n) {
    if (n <= 0 || this.length <= n) {
      throw new Error(`n must be an integer in [1, ${this.length}]`);
    }

    // For each note of the scale, make a chord.
    return [...range(this.length)].map((i) => {
      // gather intervals start, start + 2, start + 4
      const abs_intervals = [...range(n)].map((j) => {
        return this.intervals.value(i + 2 * j);
      });
      const rel_intervals = from_root(abs_intervals);
      return new ChordQuality(rel_intervals);
    });
  }

  /**
   * Given a pitch class, turn this scale into a ScaleSymbol
   * @param {number} pitch_class The pitch class
   * @returns {ScaleSymbol}
   */
  to_symbol(pitch_class) {
    return new ScaleSymbol(this.intervals.intervals, pitch_class);
  }

  /**
   * Given a root note, turn this into a concrete Scale
   * @param {number} tonic MIDI note of the tomic
   * @returns {Scale} Scale starting on the tonic
   */
  to_scale(tonic) {
    return new Scale(this.intervals.intervals, tonic);
  }
}

export class ScaleSymbol {
  /**
   * Constructor
   * @param {number[]} intervals
   * @param {number} pitch_class
   */
  constructor(intervals, pitch_class) {
    this.pitch_classes = new PitchClassStack(
      new IntervalStack(intervals),
      pitch_class,
    );
  }
}

/**
 * Scale rooted at a specific pitch and indexed starting
 * at a specific octave. E.g. a C major scale rooted with 0 = C4
 */
export class Scale {
  /**
   * Constructor
   * @param {number[]} intervals Intervals of the scale quality
   * @param {number} tonic tonic pitch (first note of the scale)
   */
  constructor(intervals, tonic) {
    this.pitches = new PitchStack(new IntervalStack(intervals), tonic);
  }

  /**
   *
   * @param {number} degree Scale degree measured from 0 at the tonic
   * @returns
   */
  value(degree) {
    return this.pitches.value(degree);
  }

  /**
   * Sequence notes for the scale. This is useful for making
   * melodies and bass lines
   * @param {number[]} degrees
   * @param {Rational} step_size
   * @return {PatternGrid<number>}
   */
  sequence(degrees, step_size) {
    const values = degrees.map((x) => this.pitches.value(x));
    return new PatternGrid(values, step_size);
  }
}
