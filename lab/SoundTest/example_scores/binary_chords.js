import { AnimationCurves } from "../../lablib/animation/AnimationCurves.js";
import { N1 } from "../../lablib/music/durations.js";
import { B4, G4, E4, C4, C3, G3 } from "../../lablib/music/pitches.js";
import {
  Note,
  Rest,
  Melody,
  parse_cycle,
  Score,
  Harmony,
} from "../../lablib/music/Score.js";
import { Gap } from "../../lablib/music/Timeline.js";
import { SpiralBurst } from "../SpiralBurst.js";

/**
 * Create an integer range [0, n)
 * Why is this not a built-in function??
 * @param {number} n The maximum value
 * @returns {number[]} an array [0, 1, ..., n - 1]
 */
function range(n) {
  return new Array(n).fill(0).map((_, i) => i);
}

/**
 * Take a number and convert to bits. They are returned in LSB order
 * @param {number} x A number
 * @param {number} width how many bits wide should the results be
 * @returns An array of size width storing the bits.
 */
function to_bits(x, width) {
  const bits = new Array(width).fill(0).map((_, i) => Boolean((x >> i) & 1));
  bits.reverse();
  return bits;
}

/**
 * Given a pattern of bits and corresponding notes, make a chord
 *
 * @template P
 * @param {Boolean[]} bit_pattern The bits in MSB first order
 * @param {Note<P>[]} chord_notes The notes to use for the chord
 * @param {Gap} silence The rest to insert in gaps
 */
function bit_chord(bit_pattern, chord_notes, silence) {
  return new Harmony(
    ...bit_pattern.map((bit, i) => (bit ? chord_notes[i] : silence))
  );
}

const chord_duration = N1;
const major_seventh = [B4, G4, E4, C4].map((x) => new Note(x, chord_duration));

const silence = new Rest(chord_duration);

// For the upper voices, Generate all 4-bit patterns and construct chords
// from them.
/**
 * @type {Boolean[][]}
 */
const bits_lsb = range(16).map((x) => to_bits(x, 4));

/**
 * @type {Melody<Number>}
 */
const upwards_progression = new Melody(
  ...bits_lsb.map((x) => bit_chord(x, major_seventh, silence))
);

// For the second half, flip the bit patterns vertically while keeping the
// pitches in the same rows. This makes the chord start on the 7th and work
// downwards
const downwards_progression = new Melody(
  ...bits_lsb.map((x) => bit_chord([...x].reverse(), major_seventh, silence))
);

const full_progression = new Melody(upwards_progression, downwards_progression);

const rhythm_bass = parse_cycle(N1, [C3, [C3, G3], C3, [C3, G3]]);
const rhythm_loop = Melody.from_loop(rhythm_bass, full_progression.duration);

export const SCORE_BINARY_CHORDS = new Score({
  parts: [
    ["supersaw", full_progression],
    ["square", rhythm_loop],
  ],
});

export const CURVES_BINARY_CHORDS = new AnimationCurves(
  SpiralBurst.spiral_burst_curves(full_progression.duration)
);
