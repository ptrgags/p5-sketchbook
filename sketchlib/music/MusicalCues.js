import { Rational } from "../Rational.js";
import { to_tone_time } from "../tone_helpers/measure_notation.js";

export class Cue {
  /**
   * @param {Rational} time Time that the cue should happen
   * @param {any} data Data for the cue
   */
  constructor(time, data) {
    this.time = time;
    this.data = data;
  }
}

export class MusicalCues {
  /**
   * Constructor
   * @param {import('tone')} tone The Tone.js module
   */
  constructor(tone) {
    this.tone = tone;
    this.events = new EventTarget();
    /**
     * @type {number[]}
     */
    this.event_ids = [];
  }

  /**
   * Schedule a set of cues
   * @param {string} cue_id ID for this set of cues (this will be the custom event name)
   * @param {Cue[]} cues
   */
  schedule(cue_id, cues) {
    const transport = this.tone.getTransport();
    const draw = this.tone.getDraw();
    for (const cue of cues) {
      const event_id = transport.schedule((time) => {
        draw.schedule(() => {
          this.events.dispatchEvent(
            new CustomEvent(cue_id, { detail: cue.data })
          );
        }, time);
      }, to_tone_time(cue.time));
      this.event_ids.push(event_id);
    }
  }

  unschedule() {
    const transport = this.tone.getTransport();
    for (const event_id of this.event_ids) {
      transport.clear(event_id);
    }
  }
}
