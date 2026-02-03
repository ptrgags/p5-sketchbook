import { IntervalStack, PitchClassStack, PitchStack } from "./IntervalStack.js";

export class ChordQuality {
  /**
   * Constructor
   * @param {number[]} intervals
   */
  constructor(intervals) {
    this.intervals = new IntervalStack(intervals);
  }

  /**
   * Convert to a chord symbol. E.g. MAJOR_TRIAD.to_symbol(C) gives
   * a C major triad
   * @param {number} pitch_class
   * @returns {ChordSymbol}
   */
  to_symbol(pitch_class) {
    return new ChordSymbol(this.intervals.intervals, pitch_class);
  }

  /**
   * Convert to a chord. E.g. MAJOR_TRIAD.to_symbol(C4) gives a
   * C4 major triad
   * @param {number} root Root note (e.g. C4)
   */
  to_chord(root) {
    return new Chord(this.intervals.intervals, root);
  }
}

export class ChordSymbol {
  /**
   * Constructor
   * @param {number[]} intervals Intervals for the chord quality
   * @param {number} pitch_class
   */
  constructor(intervals, pitch_class) {
    this.pitch_classes = new PitchClassStack(
      new IntervalStack(intervals),
      pitch_class,
    );
  }
}

export class Chord {
  /**
   * Constructor
   * @param {number[]} intervals Intervals for the chord quality
   * @param {number} root Root note
   */
  constructor(intervals, root) {
    this.pitches = new PitchStack(new IntervalStack(intervals), root);
  }
}
