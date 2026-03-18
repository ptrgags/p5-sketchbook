import { m2, M2, m3, M3, m6, M6, M7, m7, P1, P4, P5 } from "./intervals.js";
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

export const MAJOR_PENTATONIC = new ScaleQuality([P1, M2, M3, P5, M6]);
export const MINOR_PENTATONIC = new ScaleQuality([P1, m3, P4, P5, m7]);

export const DOUBLE_HARMONIC = new ScaleQuality([P1, m2, m3, P4, P5, m6, m7]);
