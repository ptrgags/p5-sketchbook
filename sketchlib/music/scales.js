import { mod } from "../mod.js";
import { m2, M2, m3, M3, m6, M6, M7, m7, P1, P4, P5 } from "./intervals.js";
import { C4 } from "./pitches.js";
import { ScaleQuality } from "./Scale.js";

export const MAJOR_SCALE = new ScaleQuality([P1, M2, M3, P4, P5, M6, M7]);
export const NATURAL_MINOR_SCALE = new ScaleQuality([
  P1,
  M2,
  m3,
  P4,
  P5,
  m6,
  m7,
]);
export const HARMONIC_MINOR_SCALE = new ScaleQuality([
  P1,
  M2,
  m3,
  P4,
  P5,
  m6,
  M7,
]);
export const MELODIC_MINOR_SCALE = new ScaleQuality([
  P1,
  M2,
  m3,
  P4,
  P5,
  M6,
  M7,
]);

export const IONIAN_MODE = MAJOR_SCALE;
export const DORIAN_MODE = MAJOR_SCALE.mode(1);
export const PHRYGIAN_MODE = MAJOR_SCALE.mode(2);
export const LYDIAN_MODE = MAJOR_SCALE.mode(3);
export const MIXOLYDIAN_MODE = MAJOR_SCALE.mode(4);
export const AEOLIAN_MODE = NATURAL_MINOR_SCALE;
export const LOCRIAN_MODE = MAJOR_SCALE.mode(6);

export const MAJOR_PENTATONIC = [P1, M2, M3, P5, M6];
export const MINOR_PENTATONIC = [P1, m3, P4, P5, m7];

export const DOUBLE_HARMONIC = [P1, m2, m3, P4, P5, m6, m7];

/**
 * Make a function that maps scale degree -> pitch for a particular scale and root note
 * @param {number[]} pitch_classes Pitch classes for a scale, starting on C. There can be a variable number of notes, but here we assume that out of range numbers are shifted up/down by an octave. Do not repeat the root note. E.g. a major scale would be [C, D, E, F, G, A, B], no need to repeat the C.
 * @param {number} [root_note=C4] note MIDI note representing where scale degree 0 is, if different than middle C. This can be used to express a scale in a different key
 * @returns {function(number): number} A callback function that takes a scale degree and returns a midi note
 */
export function make_scale(pitch_classes, root_note = C4) {
  const num_tones = pitch_classes.length;
  return (scale_degree) => {
    // The signed scale degree may be out of range, this just means
    // up or down a number of octaves. For example, for a 7-note scale,
    // -1 is the last note in the scale but down an octave (-1 = -1 * 7 + 6)
    // 9 is the third note in the scale but up an octave (9 = 1 * 7 + 2)
    const octaves = Math.floor(scale_degree / num_tones);
    const reduced_degree = mod(scale_degree, num_tones);

    // Return the absolute MIDI note
    return root_note + octaves * 12 + pitch_classes[reduced_degree];
  };
}
