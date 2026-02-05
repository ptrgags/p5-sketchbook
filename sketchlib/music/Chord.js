import { arrays_equal } from "../arrays_equal.js";
import { Rational } from "../Rational.js";
import { ChordVoicing } from "./ChordVoicing.js";
import { M3, m3, M6, m6, m7, M7, P1, P5, T } from "./intervals.js";
import { IntervalStack, PitchClassStack, PitchStack } from "./IntervalStack.js";
import { PatternGrid } from "./PatternGrid.js";
import { MIDIPitch } from "./MIDIPitch.js";

/**
 * Chord quality interval patterns and their corresponding chord symbol
 * @type {[number[], string][]}
 */
const SYMBOL_LIST = [
  // triads
  [[P1, m3, T], "dim"],
  [[P1, m3, P5], "m"],
  [[P1, M3, P5], "M"],
  [[P1, M3, m6], "aug"],
  // Seventh chords
  [[P1, m3, T, M6], "dim7"],
  [[P1, m3, T, m7], "hdim7"],
  [[P1, m3, P5, m7], "m7"],
  [[P1, m3, P5, M7], "mM7"],
  [[P1, M3, P5, m7], "7"],
  [[P1, M3, P5, M7], "M7"],
  [[P1, M3, m6, M7], "aug7"],
];

function format_intervals(intervals) {
  for (const [pattern, symbol] of SYMBOL_LIST) {
    if (arrays_equal(intervals, pattern)) {
      return symbol;
    }
  }
  return "?";
}

export class ChordQuality {
  /**
   * Constructor
   * @param {number[]} intervals
   */
  constructor(intervals) {
    this.intervals = new IntervalStack(intervals);
  }

  format() {
    return format_intervals(this.intervals.intervals);
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

  /**
   * Format as a chord symbol. Like Amin7 or G7
   * @returns {string}
   */
  format() {
    // Format the symbol, but for major triads, it's common to not have
    // any suffix. E.g. C not CM
    let symbol = format_intervals(this.pitch_classes.intervals.intervals);
    symbol = symbol === "M" ? "" : symbol;

    const pitch_class = MIDIPitch.format_pitch_class(
      this.pitch_classes.pitch_class,
    );
    return `${pitch_class}${symbol}`;
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

  /**
   * Format as a chord symbol with the octave of the root. Like A3min7 or D5maj7
   * @returns {string}
   */
  format() {
    // Format the symbol, but for major triads, it's common to not have
    // any suffix. E.g. C4 not C4M
    let symbol = format_intervals(this.pitches.intervals.intervals);
    symbol = symbol === "M" ? "" : symbol;

    const pitch = MIDIPitch.format_pitch(this.pitches.root);
    return `${pitch}${symbol}`;
  }

  /**
   * Areggiate the chord as a single monophonic pattern
   * @param {number[]} indices Indices for looking up notes
   * @param {Rational} step_size Step size for the pattern grid
   * @returns {PatternGrid<number>}
   */
  arpeggiate(indices, step_size) {
    const values = indices.map((x) => this.pitches.value(x));
    return new PatternGrid(values, step_size);
  }

  /**
   * Voice the chord by providing a list of indices, one per desired voice.
   * @param {(number | undefined)[]} indices Voices, listed from bottom to top. To leave a voice silent, use REST
   * @returns {ChordVoicing}
   */
  voice(indices) {
    const values = indices.map((x) =>
      x !== undefined ? this.pitches.value(x) : undefined,
    );
    return new ChordVoicing(values);
  }
}
