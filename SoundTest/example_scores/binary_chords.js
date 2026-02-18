import { MAJOR7 } from "../../sketchlib/music/chords.js";
import { N1, N8 } from "../../sketchlib/music/durations.js";
import { Melody } from "../../sketchlib/music/Music.js";
import { MusicPatterns } from "../../sketchlib/music/MusicPatterns.js";
import { PatternGrid } from "../../sketchlib/music/PatternGrid.js";
import { C4, C3, G3, REST } from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { range } from "../../sketchlib/range.js";
/**
 * Take a number and convert to bits. They are returned in LSB order
 * @param {number} x A number
 * @param {number} width how many bits wide should the results be
 * @returns {boolean[]} An array of size width storing the bits.
 */
function to_bits_lsb(x, width) {
  const bits = new Array(width).fill(0).map((_, i) => Boolean((x >> i) & 1));
  return bits;
}

/**
 *
 * @param {boolean[]} bits
 * @returns {(number | undefined)[]}
 */
function to_voice_indices(bits) {
  // the indices are always [0, 1, 2, 3], except when bits are 0,
  // the corresponding index is REST
  return bits.map((bit, i) => (bit ? i : REST));
}

const C4M7 = MAJOR7.to_chord(C4);

// We're going to iterate from [0, N) and play a chord for each value. This
// is done twice, first in LSB order, then MSB order
const BITS = 4;
const N = 1 << BITS;

const bits_lsb = [...range(N)].map((x) => to_bits_lsb(x, BITS));
const bits_msb = bits_lsb.map((x) => x.slice().reverse());

const indices_lsb = new PatternGrid(bits_lsb.map(to_voice_indices), N1);
const indices_msb = new PatternGrid(bits_msb.map(to_voice_indices), N1);

// Rhythm for one of the lsb/msb halves
const chord_rhythm_half = new Rhythm("x".repeat(N), N1);
// The chord is constant
const chord_pattern = new PatternGrid([C4M7], chord_rhythm_half.duration);

const upwards_progression = MusicPatterns.voice_lead(
  chord_rhythm_half,
  chord_pattern,
  indices_lsb,
);
const downwards_progression = MusicPatterns.voice_lead(
  chord_rhythm_half,
  chord_pattern,
  indices_msb,
);
const full_progression = new Melody(upwards_progression, downwards_progression);

const rhythm_bass = MusicPatterns.melody(new Rhythm("x--xx--x", N8), [
  C3,
  G3,
  C3,
  G3,
]);
const rhythm_loop = Melody.from_loop(rhythm_bass, full_progression.duration);

export const SCORE_BINARY_CHORDS = new Score(
  new Part("chords", full_progression, {
    instrument_id: "supersaw",
    midi_instrument: 90 - 1, // Pad 2
    midi_channel: 0,
  }),
  new Part("rhythm", rhythm_loop, {
    instrument_id: "square",
    midi_instrument: 37 - 1, // slap bass 1,
    midi_channel: 1,
  }),
);
