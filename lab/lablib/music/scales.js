import { mod } from "../../../sketchlib/mod.js";
import { A, AS, B, C, C4, CS, D, DS, E, F, G, GS } from "./pitches.js";

export const MAJOR = [C, D, E, F, G, A, B];
export const NATURAL_MINOR = [C, D, DS, F, G, GS, AS];
export const HARMONIC_MINOR = [C, D, DS, F, G, GS, B];

export const MAJOR_PENTATONIC = [C, D, E, G, A];

export const DOUBLE_HARMONIC = [C, CS, DS, F, G, GS, AS];

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
