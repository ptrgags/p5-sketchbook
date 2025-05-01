import { Melody, Rest } from "../music/Score.js";
import { Rational } from "../Rational.js";
import { to_tone_duration, to_tone_time } from "./measure_notation.js";
import { to_tone_pitch } from "./to_tone_pitch.js";

/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {Melody<number>} midi_melody Melody of MIDI pitches
 */
export function compile_part(tone, instrument, midi_melody) {
  const events = [];
  let offset = Rational.ZERO;

  for (const note of midi_melody.values) {
    if (note instanceof Rest) {
      offset = offset.add(note.duration);
      continue;
    }

    const start = to_tone_time(offset);
    const pitch = to_tone_pitch(note.pitch);
    const dur = to_tone_duration(note.duration);

    events.push([start, [pitch, dur]]);
  }

  return new tone.Part((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, events);
}
