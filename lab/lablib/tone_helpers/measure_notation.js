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

/**
 * Convert a duration in fractions of a measure to a Tone.js duration string like 4n for quarter note
 * @param {Rational} dur_rational Duration as a rational number
 * @returns {string} The Tone.js duration in measures:quarter_notes
 */
export function to_tone_duration(dur_rational) {
  return "4n";
}
