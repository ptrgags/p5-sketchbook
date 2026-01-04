import { Melody, Note, Rest, Harmony } from "../music/Music.js";
import { Score } from "../music/Score.js";
import { Gap, Parallel, Sequential, timeline_map } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";
import { to_tone_pitch } from "./to_tone_pitch.js";
import { make_part_clip, PartDescriptor, ToneClip } from "./tone_clips.js";

/**
 * Precompile a lone note to a part. Usually overkill, but it makes scheduling
 * more consistent.
 * @param {Note<number>} note a note expressed as MIDI note number
 * @returns {PartDescriptor} A part for the single note.
 */
function precompile_note(note) {
  return new PartDescriptor(note.duration, [
    ["0:0", [to_tone_pitch(note.pitch), to_tone_time(note.duration)]],
  ]);
}

/**
 * Compile a Melody to the events to pass into Tone.Part Exposed as this method
 * can be tested without needing dependencies on Tone.js
 * @param {(Gap | Note<number>)[]} midi_notes Melody in MIDI note values
 * @returns {[string, [string, string]][]} Array of (start_time, (pitch, duration))
 * events to pass into the Tone.Part constructor
 */
function make_part_events(midi_notes) {
  const events = [];
  let offset = Rational.ZERO;
  for (const note of midi_notes) {
    if (note instanceof Rest) {
      offset = offset.add(note.duration);
    } else if (note instanceof Note) {
      const start = to_tone_time(offset);
      const pitch = to_tone_pitch(note.pitch);
      const dur = to_tone_time(note.duration);

      /**
       * @type {[string, [string, string]]}
       */
      const event = [start, [pitch, dur]];

      events.push(event);
      offset = offset.add(note.duration);
    }
  }
  return events;
}

/**
 * Make a single ToneJS part descriptor from an array of notes
 * @param {(Gap | Note<number>)[]} notes MIDI notes
 * @returns {PartDescriptor} The computed part descriptor
 */
function make_melody_part(notes) {
  const events = make_part_events(notes);
  const duration = notes.reduce((acc, x) => acc.add(x.duration), Rational.ZERO);

  return new PartDescriptor(duration, events);
}

/**
 * Precompile sequential musical structure
 * @param {Melody<number>} midi_melody Melody of MIDI pitches
 * @returns {import("../music/Timeline.js").Timeline<PartDescriptor>} A sequence of generated clips, or undefined if there were no notes
 */
function precompile_melody(midi_melody) {
  const descriptors = [];

  /** @type {(Gap | Note<number>)[]} */
  let loose_notes = [];
  for (const child of midi_melody.children) {
    // Gather up loose notes/rests to combine into a single clip.
    if (child instanceof Rest || child instanceof Note) {
      loose_notes.push(child);
      continue;
    }

    // Upon encountering a container type, wrap up the previous run of loose
    // notes.
    if (loose_notes.length > 0) {
      const descriptor = make_melody_part(loose_notes);
      descriptors.push(descriptor);
      loose_notes = [];
    }

    if (child instanceof Melody) {
      const descriptor = precompile_melody(child);
      descriptors.push(descriptor);
    } else if (child instanceof Harmony) {
      const descriptor = precompile_harmony(child);
      descriptors.push(descriptor);
    }
  }

  if (loose_notes.length > 0) {
    const descriptor = make_melody_part(loose_notes);
    descriptors.push(descriptor);
  }

  if (descriptors.length == 0) {
    return new Gap(midi_melody.duration);
  }

  if (descriptors.length == 1) {
    return descriptors[0];
  }

  return new Sequential(...descriptors);
}

/**
 * Precompile parallel music structure
 * @param {Harmony<number>} midi_harmony Harmony of MIDI pitches
 * @returns {Parallel<PartDescriptor>} A sequence of generated clips, or undefined if there were no notes
 */
function precompile_harmony(midi_harmony) {
  const clips = [];

  // TODO: this is not ideal for chords.
  for (const child of midi_harmony.children) {
    const child_clip = precompile_music(child);
    clips.push(child_clip);
  }

  return new Parallel(...clips);
}

/**
 * Prepare to compile musical material to ToneJS types. This produces data
 * types to be passed to functions from tone_clips.js. Splitting this out
 * is helpful for unit testing and debugging, as Tone.js types are rather
 * opaque due to the callback functions.
 * Exported only for testing
 * @private
 * @param {import("../music/Music.js").Music<number>} music
 * @return {import("../music/Timeline.js").Timeline<PartDescriptor>} The precompiled clips
 */
export function precompile_music(music) {
  // A single gap compiles to silence
  if (music instanceof Gap) {
    return music;
  }

  if (music instanceof Note) {
    return precompile_note(music);
  }

  if (music instanceof Melody) {
    return precompile_melody(music);
  }

  if (music instanceof Harmony) {
    return precompile_harmony(music);
  }
}

/**
 * Compile the music to a set of ToneJS-compatible clips ready for scheduling.
 * @param {import("tone")} tone The Tone.js library
 * @param {import("tone").Synth} instrument The instrument that will play the material
 * @param {import("../music/Music.js").Music<number>} music The musical material
 * @return {import("../music/Timeline.js").Timeline<ToneClip>} The compiled music clips
 */
export function compile_music(tone, instrument, music) {
  const precompiled = precompile_music(music);
  return timeline_map((x) => {
    return make_part_clip(tone, instrument, x);
  }, precompiled);
}

/**
 * Compile a score to a set of ToneJS compatible clips ready for scheduling. This
 * bakes the instruments into the callbacks
 * @param {import("tone")} tone the Tone.js library
 * @param {{[id: string]: import("tone").Synth}} instruments The set of available instruments
 * @param {Score<number>} score The score of music
 * @returns {import("../music/Timeline.js").Timeline<ToneClip>} A timeline of music clips ready for scheduling.
 */
export function compile_score(tone, instruments, score) {
  const clips = [];
  for (const [instrument_id, music] of score.parts) {
    const clip = compile_music(tone, instruments[instrument_id], music);
    clips.push(clip);
  }

  return new Parallel(...clips);
}
