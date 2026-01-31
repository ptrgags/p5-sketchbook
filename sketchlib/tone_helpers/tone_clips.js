import { Instrument } from "../instruments/Instrument.js";
import { InstrumentMap } from "../instruments/InstrumentMap.js";
import { Note } from "../music/Music.js";
import { Rational } from "../Rational.js";
import { to_tone_pitch } from "./to_tone_pitch.js";
import { to_tone_time } from "./to_tone_time.js";

export class ToneNote {
  /**
   * Constructor
   * @param {Note<number>} note The note
   */
  constructor(note) {
    this.pitch = to_tone_pitch(note.pitch);
    this.duration = to_tone_time(note.duration);
    this.velocity = note.velocity / 127;
  }
}

export class PartDescriptor {
  /**
   * Constructor
   * @param {Rational} duration duration of the whole part
   * @param {[string, ToneNote][]} events
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
 * @param {function():Instrument} get_instrument Callback to get the instrument for this clip. This is to allow hot-swapping instruments
 * @param {PartDescriptor} descriptor The description of the notes to play
 * @returns {ToneClip} The computed Part wrapped in a ToneClip
 */
export function make_part_clip(tone, get_instrument, descriptor) {
  const part = new tone.Part((time, note) => {
    const instrument = get_instrument();
    instrument.play_note(note.pitch, note.duration, time, note.velocity);
  }, descriptor.events);

  part.loop = true;
  part.loopStart = "0:0";
  part.loopEnd = to_tone_time(descriptor.duration);
  return new ToneClip(part, descriptor.duration);
}
