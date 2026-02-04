import { N1, N16, N2, N4, N8, N8T } from "../sketchlib/music/durations.js";
import { MIDIPitch } from "../sketchlib/music/MIDIPitch.js";
import {
  A,
  A3,
  A4,
  AS4,
  B,
  B3,
  B4,
  B5,
  C,
  C3,
  C4,
  C5,
  CS4,
  D,
  D3,
  D4,
  D5,
  DS4,
  E,
  E4,
  F,
  F4,
  G,
  G3,
  G4,
  G5,
  GS,
  GS4,
  REST,
} from "../sketchlib/music/pitches.js";
import { retrograde } from "../sketchlib/music/retrograde.js";
import {
  Harmony,
  map_pitch,
  Melody,
  Note,
  parse_cycle,
  parse_melody,
  Rest,
} from "../sketchlib/music/Music.js";
import { Gap } from "../sketchlib/music/Timeline.js";
import { transpose_scale_degree } from "../sketchlib/music/transpose.js";
import { Rational } from "../sketchlib/Rational.js";
import { Part, Score } from "../sketchlib/music/Score.js";
import { PatternGrid } from "../sketchlib/music/PatternGrid.js";
import { Velocity } from "../sketchlib/music/Velocity.js";
import { HALF_DIM7, MAJOR7, MINOR7 } from "../sketchlib/music/chords.js";
import { P1 } from "../sketchlib/music/intervals.js";
import { ChordVoicing } from "../sketchlib/music/ChordVoicing.js";
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
    return MIDIPitch.from_pitch_octave(pitch_class, octave);
  };
}

const SCALE = [C, E, F, G, GS, B];
const SCALE3 = scale_to_pitch(SCALE, 3);
const SCALE4 = scale_to_pitch(SCALE, 4);
const SCALE5 = scale_to_pitch(SCALE, 5);

const MAJOR_SCALE_PITCHES = [C, D, E, F, G, A, B];
function scale_degree_to_pitch(scale, start_octave) {
  return (scale_degree) => {
    const pitch_class = scale[scale_degree % scale.length];
    const octave = start_octave + Math.floor(scale_degree / scale.length);
    return MIDIPitch.from_pitch_octave(pitch_class, octave);
  };
}
const MAJOR_SCALE = scale_degree_to_pitch(MAJOR_SCALE_PITCHES, 4);

export function binary_chords() {}
