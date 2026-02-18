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

const pitches_a = new PatternGrid([A3, E4, D4, B3, D4, E4], N4);
const pitches_b = new PatternGrid([C4, D4, C4, F4, GS4, A4], N4);

const notes_a = MusicPatterns.make_notes(pitches_a);
const notes_b = MusicPatterns.make_notes(pitches_b);

const rhythm = new Rhythm("xxx-----x-x-x-------", N8);
const melody = new Melody(rhythm.zip(notes_a), rhythm.zip(notes_b));

export const SCORE_PATTERN_TEST = new Score(
  new Part("melody", melody, {
    instrument_id: "organ",
    midi_instrument: 17 - 1,
    midi_channel: 1,
  }),
);
