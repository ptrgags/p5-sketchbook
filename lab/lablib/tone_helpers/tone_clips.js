import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";

export class PartDescriptor {
  /**
   * Constructor
   * @param {Rational} duration duration of the whole part
   * @param {[string, [string, string]][]} events
   */
  constructor(duration, events) {
    this.duration = duration;
    this.events = events;
  }
}

export class ToneClip {
  /**
   * Constructor
   * @param {import("tone").ToneEvent} material The Tone JS material
   * @param {Rational} duration The duration of the clip in measures
   */
  constructor(material, duration) {
    this.material = material;
    this.duration = duration;
  }
}

/**
 * Make a Tone.Part from a descriptor and an instrument
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {PartDescriptor} descriptor The description of the notes to play
 * @returns {ToneClip} The computed Part wrapped in a ToneClip
 */
export function make_part_clip(tone, instrument, descriptor) {
  const part = new tone.Part((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, descriptor.events);

  part.loop = true;
  part.loopStart = "0:0";
  part.loopEnd = to_tone_time(descriptor.duration);
  return new ToneClip(part, descriptor.duration);
}

/**
 * @template T
 * @typedef {(T | NestedPattern<T>)[]} NestedPattern<T>
 */

/**
 * @typedef {NestedPattern<string | undefined>} CyclePattern
 */

export class CycleDescriptor {
  /**
   * Constructor
   * @param {Rational} duration Duration of the whole cycle
   * @param {string} interval Interval between notes in Tone.js notation
   * @param {CyclePattern} pattern nested array of Tone.js notes
   */
  constructor(duration, interval, pattern) {
    this.duration = duration;
    this.interval = interval;
    this.pattern = pattern;
  }
}

/**
 * Make a Tone.Sequence from a cycle of notes
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {CycleDescriptor} cycle Description of a cycle of notes to play
 * @returns {ToneClip} The computed clip
 */
export function make_sequence_clip(tone, instrument, cycle) {
  // TODO: Need to compute this, but determining how to pass this to Cycle
  // would require something other than an array
  const note_duration = "16n";
  const seq = new tone.Sequence(
    (time, pitch) => {
      instrument.triggerAttackRelease(pitch, note_duration, time);
    },
    cycle.pattern,
    cycle.interval
  );
  seq.loop = true;

  return new ToneClip(seq, cycle.duration);
}
