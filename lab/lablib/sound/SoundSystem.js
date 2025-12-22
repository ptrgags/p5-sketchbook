import { Rational } from "../Rational.js";
import { to_tone_time } from "../tone_helpers/measure_notation.js";

export class SoundSystem {
  /**
   * Constructor
   * @param {import("tone")} tone_module the Tone.js module
   */
  constructor(tone_module) {
    this.tone = tone_module;

    this.init_requested = false;
  }

  async init() {
    if (this.init_requested) {
      return;
    }

    this.init_requested = true;

    await this.tone.start();
  }

  /**
   * Toggle the sound on/off.
   * @param {boolean} sound_on true if the sound should turn on
   */
  toggle_sound(sound_on) {
    const FADE_SEC = 0.2;
    const next_volume_db = sound_on ? 0 : -Infinity;
    // While you could set the destination's mute property, that abrupt change
    // can sound like crackling audio, so fade the volume quickly instead.
    this.tone.getDestination().volume.rampTo(next_volume_db, FADE_SEC);
  }

  /**
   * Schedule a callback at a specific time on the timeline. This uses
   * Tone.Draw.schedule() for precise timing
   * @param {Rational} event_time The time of the event as rational measures
   * @param {function():void} callback Callback
   * @returns {number} the event ID of the scheduled event
   */
  schedule(event_time, callback) {
    const transport = this.tone.getTransport();
    const draw = this.tone.getDraw();

    return transport.schedule((time) => {
      draw.schedule(callback, time);
    }, to_tone_time(event_time));
  }

  /**
   * Unschedule a bunch of events at once
   * @param {number[]} event_ids ID numbers for events
   */
  unschedule(event_ids) {
    const transport = this.tone.getTransport();
    for (const id of event_ids) {
      transport.clear(id);
    }
  }
}
