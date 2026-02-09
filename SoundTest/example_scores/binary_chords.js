import { N1 } from "../../sketchlib/music/durations.js";
import {
  Harmony,
  make_note,
  Melody,
  Note,
  parse_cycle,
  Rest,
} from "../../sketchlib/music/Music.js";
import { B4, G4, E4, C4, C3, G3 } from "../../sketchlib/music/pitches.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Gap } from "../../sketchlib/music/Timeline.js";
import { range } from "../../sketchlib/range.js";

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
    ...bit_pattern.map((bit, i) => (bit ? chord_notes[i] : silence)),
  );
}

const chord_duration = N1;
const major_seventh = [B4, G4, E4, C4].map((x) => make_note(x, chord_duration));

const silence = new Rest(chord_duration);

// For the upper voices, Generate all 4-bit patterns and construct chords
// from them.
/**
 * @type {Boolean[][]}
 */
const bits_lsb = [...range(16)].map((x) => to_bits(x, 4));

/**
 * @type {Melody<Number>}
 */
const upwards_progression = new Melody(
  ...bits_lsb.map((x) => bit_chord(x, major_seventh, silence)),
);

// For the second half, flip the bit patterns vertically while keeping the
// pitches in the same rows. This makes the chord start on the 7th and work
// downwards
const downwards_progression = new Melody(
  ...bits_lsb.map((x) => bit_chord([...x].reverse(), major_seventh, silence)),
);

const full_progression = new Melody(upwards_progression, downwards_progression);

const rhythm_bass = parse_cycle(N1, [C3, [C3, G3], C3, [C3, G3]]);
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
