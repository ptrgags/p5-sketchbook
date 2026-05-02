import { Instrument } from "../instruments/Instrument.js";
import { Note } from "../music/Music.js";
import { Riff } from "../music/Riff.js";
import { Rational } from "../Rational.js";
import { to_tone_note } from "./to_tone_note.js";
import { to_tone_time } from "./to_tone_time.js";
import { ToneClip } from "./ToneClip.js";

/**
 * Convert a riff of MIDI notes to a format for Tone.jS
 * Exposed for unit testing
 * @private
 * @param {Riff<Note<number>>} riff
 * @returns {[string, [string, string, number]][]}
 */
export function make_events(riff) {
  const step_size = riff.step_size;

  /**
   * @type {[string, [string, string, number]][]}
   */
  const result = [];
  let offset = 0;
  for (const beat of riff.beat_iter()) {
    if (Array.isArray(beat)) {
      const [note, duration_steps] = beat;
      const start = step_size.mul(new Rational(offset));
      const duration = step_size.mul(new Rational(duration_steps));
      result.push([
        to_tone_time(start),
        [to_tone_time(duration), ...to_tone_note(note)],
      ]);
      offset += duration_steps;
    } else {
      offset += beat;
    }
  }

  return result;
}

/**
 * @implements {ToneClip}
 */
export class RiffClip {
  /**
   * Constructor
   * @param {Riff<Note<number>>} riff
   */
  constructor(riff) {
    this.riff = riff;
  }

  /**
   * Convert to a Tone Part
   * @param {import("tone")} tone
   * @param {Instrument} instrument
   * @returns {import("tone").Part}
   */
  to_tone_event(tone, instrument) {
    const tone_notes = make_events(this.riff);

    return new tone.Part((time, value) => {
      const [duration, pitch, velocity] = value;
      instrument.play_note(pitch, duration, time, velocity);
    }, tone_notes);
  }
}
