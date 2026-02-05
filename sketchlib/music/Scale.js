import { Rational } from "../Rational.js";
import { ChordQuality } from "./Chord.js";
import { IntervalStack, PitchClassStack, PitchStack } from "./IntervalStack.js";
import { PatternGrid } from "./PatternGrid.js";

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
   * @param {number} start_index What interval to start the new scale at
   * @returns {ScaleQuality}
   */
  mode(start_index) {
    return new ScaleQuality(this.intervals.intervals);
  }

  /**
   * Stack thirds at each position of the scale to get
   * the chords for this key.
   * @param {number} n How many thirds to stack. E.g. 3 for triads, 4 for seventh chords
   * @returns {ChordQuality[]} A chord quality for each position in the scale.
   */
  stack_thirds(n) {
    return [];
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
