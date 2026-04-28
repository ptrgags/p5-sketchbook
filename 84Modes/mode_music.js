import { ADSR } from "../sketchlib/instruments/ADSR.js";
import { BasicSynth } from "../sketchlib/instruments/BasicSynth.js";
import { N8 } from "../sketchlib/music/durations.js";
import { Note } from "../sketchlib/music/Music.js";
import { PatternGrid } from "../sketchlib/music/PatternGrid.js";
import {
  A4,
  AS4,
  B4,
  C5,
  CS4,
  D4,
  DS4,
  E4,
  F4,
  FS4,
  G4,
  GS4,
} from "../sketchlib/music/pitches.js";
import {
  AEOLIAN_MODE,
  DORIAN_MODE,
  IONIAN_MODE,
  LOCRIAN_MODE,
  LYDIAN_MODE,
  MIXOLYDIAN_MODE,
  PHRYGIAN_MODE,
} from "../sketchlib/music/scales.js";

const SCALE_DEGREES = [0, 7, 0, 6, 0, 5, 0, 4, 0, 3, 0, 2, 0, 1, 0, 0];

const MODE_ORDER = [
  LYDIAN_MODE,
  IONIAN_MODE,
  MIXOLYDIAN_MODE,
  DORIAN_MODE,
  AEOLIAN_MODE,
  PHRYGIAN_MODE,
  LOCRIAN_MODE,
];

const ROOT_ORDER = [C5, B4, AS4, A4, GS4, G4, FS4, F4, E4, DS4, D4, CS4];

/**
 * @type {PatternGrid<number>[]}
 */
const PATTERNS = [];
for (const root of ROOT_ORDER) {
  for (const mode of MODE_ORDER) {
    const scale = mode.to_scale(root);
    const pitches = scale.sequence(SCALE_DEGREES);
    const pattern = new PatternGrid(pitches, N8).repeat(2);
    PATTERNS.push(pattern);
  }
}

// Chain all the patterns together into one big pattern
export const PATTERN_84MODES = PatternGrid.concat(...PATTERNS).map(
  (p) => new Note(p),
);

export const INSTRUMENT_84MODES = new BasicSynth("triangle", ADSR.pluck(1));
