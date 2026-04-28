import { Instrument } from "../instruments/Instrument.js";
import { Note } from "../music/Music.js";
import { PatternGrid } from "../music/PatternGrid.js";
import { Rational } from "../Rational.js";
import { to_tone_note } from "./to_tone_note.js";
import { to_tone_time } from "./to_tone_time.js";
import { ToneClip } from "./ToneClip.js";

/**
 * Tone Clip created from a PatternGrid of MIDI notes
 * @implements {ToneClip}
 */
export class PatternClip {
  /**
   * Constructor
   * @param {PatternGrid<Note<number>>} pattern PatternGrid of MIDI notes
   */
  constructor(pattern) {
    this.pattern = pattern;
  }

  /**
   * Convert the pattern to a Tone part
   * @param {import("tone")} tone
   * @param {Instrument} instrument
   * @returns {import("tone").Part}
   */
  to_tone_event(tone, instrument) {
    const step_size = this.pattern.step_size;
    const duration = to_tone_time(step_size);
    /** @type {[string, [string, number]][]} */
    const tone_notes = this.pattern.values.map((x, i) => {
      const start = step_size.mul(new Rational(i));
      return [to_tone_time(start), to_tone_note(x)];
    });

    return new tone.Part((time, value) => {
      const [pitch, velocity] = value;
      instrument.play_note(pitch, duration, time, velocity);
    }, tone_notes);
  }
}
