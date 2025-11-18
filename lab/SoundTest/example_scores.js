import { N1, N2, N4, N8 } from "../lablib/music/durations.js";
import { MidiPitch } from "../lablib/music/pitch_conversions.js";
import {
  A,
  B,
  B4,
  C,
  C3,
  C4,
  D,
  E,
  E4,
  F,
  G,
  G3,
  G4,
  GS,
  REST,
} from "../lablib/music/pitches.js";
import { retrograde } from "../lablib/music/retrograde.js";
import {
  Harmony,
  map_pitch,
  Melody,
  MusicLoop,
  Note,
  parse_cycle,
  parse_melody,
  Rest,
  Score,
} from "../lablib/music/Score.js";
import { Gap } from "../lablib/music/Timeline.js";
import { transpose_scale_degree } from "../lablib/music/transpose.js";
import { Rational } from "../lablib/Rational.js";

/**
 * Convert a scale to a pitch, using a fixed octave
 * @param {number[]} scale Array of pitch classes for the scale
 * @param {number} octave octave number
 * @returns {function(number):number} A callback function for transforming
 * scale degrees to pitches
 */
function scale_to_pitch(scale, octave) {
  return (scale_degree) => {
    const pitch_class = scale[scale_degree];
    return MidiPitch.from_pitch_octave(pitch_class, octave);
  };
}

const SCALE = [C, E, F, G, GS, B];
const SCALE3 = scale_to_pitch(SCALE, 3);
const SCALE4 = scale_to_pitch(SCALE, 4);
const SCALE5 = scale_to_pitch(SCALE, 5);

export function layered_melody() {
  const pedal = parse_melody([C3, N4], [REST, N4]);

  const N4D = new Rational(3, 8);

  // scores are expressed in scale degrees then converted to pitches
  const scale_arp = map_pitch(
    SCALE4,
    parse_melody(
      // Measure 1
      [0, N4],
      [1, N4],
      [2, N4],
      [3, N4],
      // Measure 2
      [4, N4D],
      [REST, N8],
      [5, N4D],
      [REST, N8]
    )
  );

  const cycle_length = N1;
  const cycle_a = map_pitch(
    SCALE5,
    parse_cycle(cycle_length, [0, REST, 1, 2, REST, 4])
  );

  const cycle_b = map_pitch(
    SCALE5,
    parse_cycle(cycle_length, [
      [0, 3],
      [5, REST],
      [0, 4, 2, 4],
    ])
  );

  const sine_part = new MusicLoop(new Rational(34, 1), pedal);
  const square_part = new Melody(
    new Rest(new Rational(2, 1)),
    new MusicLoop(new Rational(22, 1), scale_arp)
  );
  const poly_part = new Harmony(
    new Melody(
      new Rest(new Rational(8, 1)),
      new MusicLoop(new Rational(12, 1), cycle_a),
      new Rest(new Rational(4, 1)),
      new MusicLoop(new Rational(4, 1), cycle_a)
    ),
    new Melody(
      new Rest(new Rational(8, 1)),
      new MusicLoop(new Rational(8, 1), cycle_b),
      new Rest(new Rational(4, 1)),
      new MusicLoop(new Rational(4, 1), cycle_b),
      new Rest(new Rational(4, 1)),
      new MusicLoop(new Rational(4, 1), cycle_b)
    )
  );

  return new Score(
    ["sine", sine_part],
    ["square", square_part],
    ["poly", poly_part]
  );
}

export function phase_scale() {
  // Three scales initially the same, but with different lengths
  const phase_a = parse_cycle(new Rational(6, 8), [0, 1, 2, 3, 2, 1]);
  const phase_b = parse_cycle(new Rational(1, 1), [0, 1, 2, 3, 4, 3, 2, 1]);
  const phase_c = parse_cycle(
    new Rational(10, 8),
    [0, 1, 2, 3, 4, 5, 4, 3, 2, 1]
  );

  // lcm(6, 8, 10) = 120, divide by 4 to get number of measures, 30
  const total_duration = new Rational(30, 1);
  const phase_part_scale = new Harmony(
    new MusicLoop(total_duration, phase_a),
    new MusicLoop(total_duration, phase_b),
    new MusicLoop(total_duration, phase_c)
  );

  const phase_part_midi = map_pitch(SCALE3, phase_part_scale);
  return new Score(["poly", phase_part_midi]);
}

const MAJOR_SCALE_PITCHES = [C, D, E, F, G, A, B];
function scale_degree_to_pitch(scale, start_octave) {
  return (scale_degree) => {
    const pitch_class = scale[scale_degree % scale.length];
    const octave = start_octave + Math.floor(scale_degree / scale.length);
    return MidiPitch.from_pitch_octave(pitch_class, octave);
  };
}
const MAJOR_SCALE = scale_degree_to_pitch(MAJOR_SCALE_PITCHES, 4);

export function symmetry_melody() {
  // The top line plays a short motif while the bottom line holds a long note.
  const top_motif = parse_melody(
    [0, N4],
    [2, N2],
    [4, N8],
    [2, N8],
    [7, N4],
    [6, N4],
    [5, N4],
    [4, N4]
  );
  const bottom_motif = new Note(0, new Rational(2, 1));

  const motif_scale = new Harmony(top_motif, bottom_motif);

  const motif_third = transpose_scale_degree(2, motif_scale);
  const motif_sixth = transpose_scale_degree(4, motif_scale);
  const motif_ninth = transpose_scale_degree(8, motif_scale);

  const final_chord = new Harmony(
    new Note(0, N1),
    new Note(2, N1),
    new Note(4, N1)
  );

  const sequence = new Melody(
    motif_scale,
    motif_third,
    motif_sixth,
    motif_ninth
  );
  const sequence_retrograde = retrograde(sequence);
  const part_scale = new Melody(sequence, sequence_retrograde, final_chord);

  const part_midi = map_pitch(MAJOR_SCALE, part_scale);

  return new Score(["supersaw", part_midi]);
}

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

export function binary_chords() {
  const chord_duration = N1;
  const major_seventh = [B4, G4, E4, C4].map(
    (x) => new Note(x, chord_duration)
  );

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

  const full_progression = new Melody(
    upwards_progression,
    downwards_progression
  );

  const rhythm_bass = parse_cycle(N1, [C3, [C3, G3], C3, [C3, G3]]);
  const rhythm_loop = new MusicLoop(full_progression.duration, rhythm_bass);

  return new Score(["supersaw", full_progression], ["square", rhythm_loop]);
}
