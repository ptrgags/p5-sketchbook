import { ChordQuality } from "./Chord.js";
import { m3, M3, M6, m6, m7, M7, P1, P5, T } from "./intervals.js";

// Triads
export const DIMINISHED_TRIAD = Object.freeze(new ChordQuality([P1, m3, T]));
export const MINOR_TRIAD = Object.freeze(new ChordQuality([P1, m3, P5]));
export const MAJOR_TRIAD = Object.freeze(new ChordQuality([P1, M3, P5]));
export const AUGMENTED_TRIAD = Object.freeze(new ChordQuality([P1, M3, m6]));

// Seventh chords. There's only 7 of them since (aug triad + M3) is
// just an augmented triad with the root doubled.
export const DIM7 = Object.freeze(new ChordQuality([P1, m3, T, M6]));
export const HALF_DIM7 = Object.freeze(new ChordQuality([P1, m3, T, m7]));
export const MINOR7 = Object.freeze(new ChordQuality([P1, m3, P5, m7]));
export const MIN_MAJ7 = Object.freeze(new ChordQuality([P1, m3, P5, M7]));
export const DOM7 = Object.freeze(new ChordQuality([P1, M3, P5, m7]));
export const MAJOR7 = Object.freeze(new ChordQuality([P1, M3, P5, M7]));
export const AUG7 = Object.freeze(new ChordQuality([P1, M3, m6, M7]));
