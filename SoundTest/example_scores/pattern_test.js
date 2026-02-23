import { N1, N2, N4, N8 } from "../../sketchlib/music/durations.js";
import { Melody } from "../../sketchlib/music/Music.js";
import { MusicPatterns } from "../../sketchlib/music/MusicPatterns.js";
import { PatternGrid } from "../../sketchlib/music/PatternGrid.js";
import {
  A3,
  E4,
  D4,
  B3,
  C4,
  F4,
  GS4,
  A4,
  A2,
} from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { HARMONIC_MINOR_SCALE } from "../../sketchlib/music/scales.js";
import { Part, Score } from "../../sketchlib/music/Score.js";
import { Velocity } from "../../sketchlib/music/Velocity.js";
import { Rational } from "../../sketchlib/Rational.js";

const rhythm = new Rhythm("xxx-----|x-x-x---", N8);
const motif_a = MusicPatterns.melody(rhythm, [A3, E4, D4, B3, D4, E4]);
const motif_b = MusicPatterns.melody(rhythm, [C4, D4, C4, F4, GS4, A4]);
const melody = new Melody(motif_a, motif_b);

const SCALE = HARMONIC_MINOR_SCALE.to_scale(A2);
const SCALE_CHORDS = SCALE.stack_thirds(3);

const TWO_MEASURES = new Rational(2);
const chord_rhythm = new Rhythm("xx", TWO_MEASURES);
// i - III progression
const chords = new PatternGrid(
  [SCALE_CHORDS[0], SCALE_CHORDS[3]],
  TWO_MEASURES,
);
// Go down two octaves
const transpose_down = new PatternGrid([0, -1], TWO_MEASURES);
const velocity = new PatternGrid([Velocity.MP], chord_rhythm.duration);
const chord_part = MusicPatterns.block_chords(
  chord_rhythm,
  chords,
  transpose_down,
  velocity,
);

export const SCORE_PATTERN_TEST = new Score(
  new Part("melody", melody, {
    instrument_id: "square",
    midi_instrument: 17 - 1, // Lead 1 (Square)
    midi_channel: 1,
  }),
  new Part("block_chords", chord_part, {
    instrument_id: "poly",
    midi_instrument: 89 - 1, // Pad 1
    midi_channel: 2,
  }),
);
