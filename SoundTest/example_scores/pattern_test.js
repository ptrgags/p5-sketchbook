import { N4, N8 } from "../../sketchlib/music/durations.js";
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
} from "../../sketchlib/music/pitches.js";
import { Rhythm } from "../../sketchlib/music/Rhythm.js";
import { Part, Score } from "../../sketchlib/music/Score.js";

const rhythm = new Rhythm("xxx-----|x-x-x---", N8);
const motif_a = MusicPatterns.melody(rhythm, [A3, E4, D4, B3, D4, E4]);
const motif_b = MusicPatterns.melody(rhythm, [C4, D4, C4, F4, GS4, A4]);
const melody = new Melody(motif_a, motif_b);

export const SCORE_PATTERN_TEST = new Score(
  new Part("melody", melody, {
    instrument_id: "organ",
    midi_instrument: 17 - 1,
    midi_channel: 1,
  }),
);
