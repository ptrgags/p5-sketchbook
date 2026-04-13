import { Instrument } from "../instruments/Instrument.js";
import { Note } from "../music/Music.js";
import { Riff } from "../music/Riff.js";
import { Rational } from "../Rational.js";
import { to_tone_pitch } from "./to_tone_pitch.js";
import { to_tone_time } from "./to_tone_time.js";
import { to_tone_velocity } from "./to_tone_velocity.js";

/**
 * Precompile a riff to an intermediate format
 * @param {Riff<Note<number>>} riff
 * @returns {Generator<[number, Note<number>, number]>} tuples of (start_step, note, duration_steps)
 */
function* precompile(riff) {
  let offset_steps = 0;
  for (const beat of riff.beat_iter()) {
    if (Array.isArray(beat)) {
      const [note, duration_steps] = beat;
      yield [offset_steps, note, duration_steps];
      offset_steps += duration_steps;
    } else {
      // for a rest, beat is just the duration
      offset_steps += beat;
    }
  }
}

/**
 * Precompile a riff to a format that can be passed to a Tone.js callback
 * @param {Riff<Note<number>>} riff
 * @returns {[string, [string, string, number]][]} Tuples of (start_time, (pitch, duration, velocity))
 */
function precompile_tone(riff) {
  return precompile(riff)
    .toArray()
    .map(([start_steps, note, duration_steps]) => {
      const start_time = riff.step_size.mul(new Rational(start_steps));
      const duration = riff.step_size.mul(new Rational(duration_steps));
      return [
        to_tone_time(start_time),
        [
          to_tone_pitch(note.pitch),
          to_tone_time(duration),
          to_tone_velocity(note.velocity),
        ],
      ];
    });
}

export class RiffClip {
  /**
   * Constructor
   * @param {Riff<Note<number>>} riff Riff of MIDI notes
   */
  constructor(riff) {
    this.riff = riff;

    this.events = precompile_tone(riff);
  }

  /**
   * Creat
   * @param {import("tone")} tone Tone.js library
   * @param {Instrument} instrument the instrument to play
   * @returns {import("tone").ToneEvent} The compiled tone clip
   */
  to_tone_clip(tone, instrument) {
    return new tone.Part((time, note) => {
      const [pitch, duration, velocity] = note;
      instrument.play_note(pitch, duration, time /*velocity*/);
    }, this.events);
  }
}
