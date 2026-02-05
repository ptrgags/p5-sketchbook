import { TimeInterval } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./to_tone_time.js";

export class PartDescriptor {
  /**
   * Constructor
   * @param {[string, [string, string]][]} events
   */
  constructor(events) {
    this.events = events;
  }
}

/**
 * Make a PartDescriptor wrapped in a time interval like the
 * old interface
 * @param {Rational} duration
 * @param {[string, [string, string]][]} events
 * @returns {TimeInterval<PartDescriptor>}
 */
export function make_part_descriptor(duration, events) {
  return new TimeInterval(new PartDescriptor(events), duration);
}

export class ToneClip {
  /**
   * Constructor
   * @param {import("tone").ToneEvent} material The Tone JS material
   */
  constructor(material) {
    this.material = material;
  }
}

/**
 * Make a Tone.Part from a descriptor and an instrument
 * @param {import("tone")} tone the Tone.js library
 * @param {import("tone").Synth} instrument the instrument to play
 * @param {TimeInterval<PartDescriptor>} descriptor The description of the notes to play
 * @returns {TimeInterval<ToneClip>} The computed Part wrapped in a ToneClip
 */
export function make_part_clip(tone, instrument, descriptor) {
  const part = new tone.Part((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, descriptor.value.events);

  part.loop = true;
  part.loopStart = "0:0";
  part.loopEnd = to_tone_time(descriptor.duration);
  return new TimeInterval(new ToneClip(part), descriptor.duration);
}
