import { REST } from "../music/pitches.js";
import { MusicCycle, Melody, Note, Rest } from "../music/Score.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";
import { to_tone_pitch } from "./to_tone_pitch.js";

/**
 * Compile a Melody to the events to pass into Tone.Part Exposed as this method
 * can be tested without needing dependencies on Tone.js
 * @param {Melody<number>} midi_melody Melody in MIDI note values
 * @returns {[string, [string, string]][]} Array of (start_time, (pitch, duration))
 * events to pass into the Tone.Part constructor
 */
export function compile_part_events(midi_melody) {
  const events = [];
  let offset = Rational.ZERO;
  for (const note of midi_melody.children) {
    if (note instanceof Rest) {
      offset = offset.add(note.duration);
      continue;
    }

    if (note instanceof Note) {
      const start = to_tone_time(offset);
      const pitch = to_tone_pitch(note.pitch);
      const dur = to_tone_time(note.duration);

      /**
       * @type {[string, [string, string]]}
       */
      const event = [start, [pitch, dur]];

      events.push(event);
      offset = offset.add(note.duration);
      continue;
    }

    throw new Error("other musical types not implemented");
  }
  return events;
}

/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {Melody<number>} midi_melody Melody of MIDI pitches
 * @returns {import("tone").Part} The computed part
 */
export function compile_part(tone, instrument, midi_melody) {
  const events = compile_part_events(midi_melody);
  return new tone.Part((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, events);
}

export function compile_sequence_pattern(midi_cycle) {
  const beats = [];
  for (const child of midi_cycle.children) {
    if (child instanceof Rest) {
      beats.push(REST);
      continue;
    }

    if (child instanceof Note) {
      const pitch = to_tone_pitch(child.pitch);
      beats.push(pitch);
      continue;
    }

    if (child instanceof MusicCycle) {
      const sub_cycle = compile_sequence_pattern(child);
      beats.push(sub_cycle);
      continue;
    }

    throw new Error("Other musical types not implemented");
  }

  return beats;
}

/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {MusicCycle<number>} midi_cycle Cycle of MIDI notes
 * @returns {import("tone").Sequence} The computed part
 */
export function compile_sequence(tone, instrument, midi_cycle) {
  const pattern = compile_sequence_pattern(midi_cycle);
  const beat_duration = midi_cycle.duration.mul(midi_cycle.subdivision);
  const tone_interval = to_tone_time(beat_duration);

  // TODO: Need to compute this, but determining how to pass this to Cycle
  // would require something other than an array
  const note_duration = "16n";
  return new tone.Sequence(
    (time, pitch) => {
      instrument.triggerAttackRelease(pitch, note_duration, time);
    },
    pattern,
    tone_interval
  );
}

/**
 * Compile music to a Tone.js Part or Sequence
 * @param {import("tone")} tone The Tone.js library
 * @param {import("tone").Synth} instrument
 * @param {import("../music/Score.js").Music<number>} music
 * @return {import("tone").Sequence | import("tone").Part} The compiled music
 */
export function compile_music(tone, instrument, music) {
  if (music instanceof Melody) {
    return compile_part(tone, instrument, music);
  }

  if (music instanceof MusicCycle) {
    return compile_sequence(tone, instrument, music);
  }

  throw new Error("Only Melody and Cycle are currently supported");
}
