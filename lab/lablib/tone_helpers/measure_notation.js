import { N1, N2, N4 } from "../music/durations.js";
import { Rational } from "../Rational.js";

/**
 * Convert a rational number of measures to a Tone.js m:q string
 * @param {Rational} time_rational The time in rational measures
 * @returns {string} The tone time in measures:quarter_notes
 */
export function to_tone_time(time_rational) {
  const measures = time_rational.quotient;

  const remainder_measures = time_rational.real % 1.0;
  const remainder_beats = remainder_measures * 4;
  return `${measures}:${remainder_beats}`;
}
