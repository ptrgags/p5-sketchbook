import { Instrument } from "../instruments/Instrument.js";

/**
 * Clip of music that can be converted to ToneJS types
 * @interface ToneClip
 */
export class ToneClip {
  /**
   * Convert the clip to a ToneJS event
   * @param {import("tone")} tone
   * @param {Instrument} instrument
   * @returns {import("tone").ToneEvent}
   */
  to_tone_event(tone, instrument) {
    throw new Error("not implemented");
  }
}
