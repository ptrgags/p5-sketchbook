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
 * @param {TimeInterval<PartDescriptor>} descriptor The description of the notes to play
 * @returns {ToneClip} The computed Part wrapped in a ToneClip
 */
export function make_part_clip(tone, instrument, descriptor) {
  const part = new tone.Part((time, note) => {
    const [pitch, duration] = note;
    instrument.triggerAttackRelease(pitch, duration, time);
  }, descriptor.value.events);

  part.loop = true;
  part.loopStart = "0:0";
  part.loopEnd = to_tone_time(descriptor.duration);
  return new ToneClip(part, descriptor.duration);
}
