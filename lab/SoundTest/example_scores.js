import { N1, N2, N4, N8 } from "../lablib/music/durations";
import { MidiPitch } from "../lablib/music/pitch_conversions";
import { A, B, C, C3, D, E, F, G, GS, REST } from "../lablib/music/pitches";
import { retrograde } from "../lablib/music/retrograde";
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
} from "../lablib/music/Score";
import { transpose_scale_degree } from "../lablib/music/transpose";
import { Rational } from "../lablib/Rational";

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

  const phase_part_scale = new MusicLoop(
    new Rational(30, 1),
    new Harmony(phase_a, phase_b, phase_c)
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
  const top_motif = parse_melody([0, N4], [2, N2], [4, N8], [2, N8], [8, N1]);
  const bottom_motif = new Note(0, N1.mul(Rational.ONE));

  const motif_scale = new Harmony(top_motif, bottom_motif);

  const motif_third = transpose_scale_degree(2, motif_scale);
  const motif_sixth = transpose_scale_degree(4, motif_scale);
  const motif_ninth = transpose_scale_degree(8, motif_scale);

  const sequence = new Melody(
    motif_scale,
    motif_third,
    motif_sixth,
    motif_ninth
  );
  const sequence_retrograde = retrograde(sequence);
  const part_scale = new Melody(sequence, sequence_retrograde);

  const part_midi = map_pitch(MAJOR_SCALE, part_scale);

  return new Score(["supersaw", part_midi]);
}
