import { REST } from "../music/pitches.js";
import { MusicCycle, Melody, Note, Rest, Harmony, MusicLoop, Score } from "../music/Score.js";
import { Gap, Loop, Parallel, Sequential } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";
import { to_tone_pitch } from "./to_tone_pitch.js";


/**
 * Compile a single note to a musical clip
 * @param {import("tone")} tone Tone.js library
 * @param {import("tone").Synth} instrument ToneJS instrument to play 
 * @param {Note<number>} midi_note The MIDI note to play
 * @returns {ToneClip} A tone event
 */
export function compile_note(tone, instrument, midi_note) {
  const event = [to_tone_pitch(midi_note.pitch), to_tone_time(midi_note.duration)];
  const tone_event = new tone.ToneEvent((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, event);

  tone_event.loop = true;

  return new ToneClip(tone_event, midi_note.duration);
}

/**
 * Compile a Melody to the events to pass into Tone.Part Exposed as this method
 * can be tested without needing dependencies on Tone.js
 * @param {(Gap | Note<number>)[]} midi_notes Melody in MIDI note values
 * @returns {[string, [string, string]][]} Array of (start_time, (pitch, duration))
 * events to pass into the Tone.Part constructor
 */
export function compile_part_events(midi_notes) {
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
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {(Gap | Note<number>)[]} midi_notes Melody of MIDI pitches
 * @returns {import("tone").Part} The computed part
 */
export function make_part(tone, instrument, midi_notes) {
  const events = compile_part_events(midi_notes);
  const part = new tone.Part((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, events);

  part.loop = true;
  return part;
}

/**
 * When melodies have a mix of notes and container types, group them into
 * Melody blocks
 * @template P
 * @param {Melody<P>} melody 
 * @returns {import("../music/Timeline.js").Timeline<Note<P>>[]} An array of
 * container
 */
function normalize_melody(melody) {
  const children = [];

  let current_run = [];
  for (const child of melody.children) {
    if (child instanceof Rest || child instanceof Note) {
      current_run.push(child);
      continue;
    }

    if (current_run.length > 0) {
      children.push(new Melody(...current_run));
      current_run = [];
    }

    children.push(child);
  }

  if (current_run.length > 0) {
    children.push(new Melody(...current_run));
  }

  return children;
}


/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {Melody<number>} midi_melody Melody of MIDI pitches
 * @returns {import("../music/Timeline.js").Timeline<ToneClip>} A sequence of generated clips, or undefined if there were no notes
 */
export function compile_melody(tone, instrument, midi_melody) {
  const clips = [];

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
      const part = make_part(tone, instrument, loose_notes);
      const duration = loose_notes.reduce((acc, x) => acc.add(x.duration), Rational.ZERO);
      const clip = new ToneClip(part, duration);
      clips.push(clip);
      loose_notes = [];
    }

    if (child instanceof Melody) {
      const clip = compile_melody(tone, instrument, child);
      clips.push(clip);
    } else if (child instanceof Harmony) {
      const clip = compile_harmony(tone, instrument, child);
      clips.push(clip);
    } else if (child instanceof MusicCycle) {
      const clip = compile_cycle(tone, instrument, child);
      clips.push(clip);
    } else {
      // MusicLoop
      const clip = compile_loop(tone, instrument, child);
      clips.push(clip);
    }
  }

  if (clips.length == 0) {
    return new Gap(midi_melody.duration);
  }

  if (clips.length == 1) {
    return clips[0];
  }

  return new Sequential(...clips);
}

/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {Harmony<number>} midi_harmony Harmony of MIDI pitches
 * @returns {Gap | ToneClip | Parallel<ToneClip>} A sequence of generated clips, or undefined if there were no notes
 */
export function compile_harmony(tone, instrument, midi_harmony) {
  throw new Error("not implemented");
}

export function is_simple_cycle(music) {
  if (music instanceof Gap || music instanceof Note) {
    return true
  }

  if (music instanceof MusicCycle) {
    return music.children.every(x => is_simple_cycle(music));
  }

  return false;
}

/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {MusicCycle<number>} midi_cycle Melody of MIDI pitches
 * @returns {ToneClip} A sequence of generated clips, or undefined if there were no notes
 */
export function compile_cycle(tone, instrument, midi_cycle) {
  if (is_simple_cycle(midi_cycle)) {
    return compile_sequence(tone, instrument, midi_cycle)
  }

  // a complex cycle will take more thought.
  throw new Error("complex cycles not implemented");
}


/**
 * 
 * @param {MusicCycle<number>} midi_cycle 
 * @returns 
 */
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
 * @returns {ToneClip} The computed part
 */
export function compile_sequence(tone, instrument, midi_cycle) {
  const pattern = compile_sequence_pattern(midi_cycle);
  const beat_duration = midi_cycle.duration.mul(midi_cycle.subdivision);
  const tone_interval = to_tone_time(beat_duration);

  // TODO: Need to compute this, but determining how to pass this to Cycle
  // would require something other than an array
  const note_duration = "16n";
  const seq = new tone.Sequence(
    (time, pitch) => {
      instrument.triggerAttackRelease(pitch, note_duration, time);
    },
    pattern,
    tone_interval
  );
  seq.loop = true;

  return new ToneClip(seq, midi_cycle.duration);
}

/**
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {MusicLoop<number>} midi_loop Loop of MIDI pitches
 * @returns {Loop<ToneClip>} A sequence of generated clips, or undefined if there were no notes
 */
export function compile_loop(tone, instrument, midi_loop) {
  const child = compile_music(tone, instrument, midi_loop.child);
  return new Loop(midi_loop.duration, child);
}

export class ToneClip {
  /**
   * Constructor
   * @param {import("tone").ToneEvent} material The 
   * @param {Rational} duration The duration of the clip in measures
   */
  constructor(material, duration) {
    this.material = material;
    this.duration = duration;
  }
}

/**
 * Compile music to a Tone.js Part or Sequence
 * @param {import("tone")} tone The Tone.js library
 * @param {import("tone").Synth} instrument
 * @param {import("../music/Score.js").Music<number>} music
 * @return {import("../music/Timeline.js").Timeline<ToneClip>} The compiled music clips, or undefined if the timeline is empty
 */
export function compile_music(tone, instrument, music) {
  // A single gap compiles to silence
  if (music instanceof Gap) {
    return music;
  }

  if (music instanceof Note) {
    return compile_note(tone, instrument, music);
  }

  if (music instanceof Melody) {
    return compile_melody(tone, instrument, music);
  }

  if (music instanceof Harmony) {
    return compile_harmony(tone, instrument, music);
  }

  if (music instanceof MusicCycle) {
    return compile_cycle(tone, instrument, music);
  }

  if (music instanceof Loop) {
    return compile_loop(tone, instrument, music);
  }

  throw new Error("Only Melody and Cycle are currently supported");
}

/**
 * 
 * @param {import("tone")} tone 
 * @param {{[id: string]: import("tone").Synth}} instruments 
 * @param {Score<number>} score 
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