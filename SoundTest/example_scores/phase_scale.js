import { N8 } from "../../sketchlib/music/durations.js";
import { Melody } from "../../sketchlib/music/Music.js";
import { MusicPatterns } from "../../sketchlib/music/MusicPatterns.js";
import { C3 } from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { MINOR_PENTATONIC } from "../../sketchlib/music/scales.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Rational } from "../../sketchlib/Rational.js";

// Three scales are initially the same, but have different lengths
const SCALE = MINOR_PENTATONIC.to_scale(C3);
const phase_a = MusicPatterns.scale_melody(
  new Rhythm("xxxxxx", N8),
  SCALE,
  [0, 1, 2, 3, 2, 1],
);
const phase_b = MusicPatterns.scale_melody(
  new Rhythm("xxxxxxxx", N8),
  SCALE,
  [0, 1, 2, 3, 4, 3, 2, 1],
);
const phase_c = MusicPatterns.scale_melody(
  new Rhythm("xxxxxxxxxx", N8),
  SCALE,
  [0, 1, 2, 3, 4, 5, 4, 3, 2, 1],
);

// lcm(6, 8, 10) = 120 eighth notes duration total
const total_duration = new Rational(120, 8);
const part_a = Melody.from_loop(phase_a, total_duration);
const part_b = Melody.from_loop(phase_b, total_duration);
const part_c = Melody.from_loop(phase_c, total_duration);

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
