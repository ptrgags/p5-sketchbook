import {
  parse_cycle,
  Harmony,
  Melody,
  map_pitch,
} from "../../sketchlib/music/Music.js";
import { C3 } from "../../sketchlib/music/pitches.js";
import { make_scale, MINOR_PENTATONIC } from "../../sketchlib/music/scales.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Rational } from "../../sketchlib/Rational.js";

// Three scales initially the same, but with different lengths
const phase_a = parse_cycle(new Rational(6, 8), [0, 1, 2, 3, 2, 1]);
const phase_b = parse_cycle(Rational.ONE, [0, 1, 2, 3, 4, 3, 2, 1]);
const phase_c = parse_cycle(
  new Rational(10, 8),
  [0, 1, 2, 3, 4, 5, 4, 3, 2, 1],
);

// lcm(6, 8, 10) = 120 eighth notes duration total
const total_duration = new Rational(120, 8);
const phase_part_scale = new Harmony(
  Melody.from_loop(phase_a, total_duration),
  Melody.from_loop(phase_b, total_duration),
  Melody.from_loop(phase_c, total_duration),
);

const SCALE3 = make_scale(MINOR_PENTATONIC, C3);
const phase_part_midi = map_pitch(SCALE3, phase_part_scale);

export const SCORE_PHASE_SCALE = new Score(
  new Part("phase", phase_part_midi, {
    instrument_id: "poly",
    midi_instrument: 10 - 1, // glockenspiel,
    midi_channel: 0,
  }),
);
