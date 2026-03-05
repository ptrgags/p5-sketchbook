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

const SCALE3 = make_scale(MINOR_PENTATONIC, C3);
// lcm(6, 8, 10) = 120 eighth notes duration total
const total_duration = new Rational(120, 8);

const part_a = map_pitch(SCALE3, Melody.from_loop(phase_a, total_duration));
const part_b = map_pitch(SCALE3, Melody.from_loop(phase_b, total_duration));
const part_c = map_pitch(SCALE3, Melody.from_loop(phase_c, total_duration));

export const SCORE_PHASE_SCALE = new Score(
  new Part("phase1", part_a, {
    instrument_id: "poly",
    midi_instrument: 10 - 1, // glockenspiel,
    midi_channel: 0,
  }),
  new Part("phase2", part_b, {
    instrument_id: "poly",
    midi_instrument: 10 - 1, // glockenspiel,
    midi_channel: 1,
  }),
  new Part("phase3", part_c, {
    instrument_id: "poly",
    midi_instrument: 10 - 1, // glockenspiel,
    midi_channel: 2,
  }),
);
