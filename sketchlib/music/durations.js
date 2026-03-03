import { Rational } from "../Rational.js";

// Durations are given as fractions of a measure of 4/4 time

// whole notes to 64th notes
export const N1 = new Rational(1, 1);
export const N2 = new Rational(1, 2);
export const N4 = new Rational(1, 4);
export const N8 = new Rational(1, 8);
export const N16 = new Rational(1, 16);
export const N32 = new Rational(1, 32);
export const N64 = new Rational(1, 64);

// triplets put 3 pulses in the space where 2 of the note type is.
// This means that e.g. a quarter note triplet is 2/3 * 1/4 = 1/6
const TRIPLET = new Rational(2, 3);
export const N1T = TRIPLET.mul(N1);
export const N2T = TRIPLET.mul(N2);
export const N4T = TRIPLET.mul(N4);
export const N8T = TRIPLET.mul(N8);
export const N16T = TRIPLET.mul(N16);
export const N32T = TRIPLET.mul(N32);
export const N64T = TRIPLET.mul(N64);

// Dotted notes are 1.5 times the length
export const DOTTED = new Rational(3, 2);
export const N1D = N1.mul(DOTTED);
export const N2D = N2.mul(DOTTED);
export const N4D = N4.mul(DOTTED);
export const N8D = N8.mul(DOTTED);
export const N16D = N16.mul(DOTTED);
export const N32D = N32.mul(DOTTED);
export const N64D = N64.mul(DOTTED);
