import { Rational } from "../Rational.js";
import { to_tone_time } from "../tone_helpers/to_tone_time.js";
import { AbsTimelineOps } from "./AbsTimelineOps.js";
import { Score } from "./Score.js";

export class Cue {
  /**
   * @param {Rational} time Time that the cue should happen
   * @param {any} data Data for the cue
   */
  constructor(time, data) {
    this.time = time;
    this.data = data;
  }

  /**
   * Generate cues for note on/note off events from a score.
   * @param {Score<number>} score
   * @returns {{
   *    note_on: Cue[],
   *    note_off: Cue[]
   * }}
   */
  static make_note_cues(score) {
    const note_on = [];
    const note_off = [];
    for (const part of score.parts) {
      const abs_part = AbsTimelineOps.from_relative(part.music);
      for (const note of abs_part) {
        const note_on_cue = new Cue(note.start_time, note);
        const note_off_cue = new Cue(note.end_time, note);
        note_on.push(note_on_cue);
        note_off.push(note_off_cue);
      }
    }

    return {
      note_on,
      note_off,
    };
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
            new CustomEvent(cue_id, { detail: cue.data }),
          );
        }, time);
      }, to_tone_time(cue.time));
      this.event_ids.push(event_id);
    }
  }

  /**
   * Schedule note on and note off events from a score
   * @param {Score<number>} score The score to schedule
   */
  schedule_notes(score) {
    const { note_on, note_off } = Cue.make_note_cues(score);
    this.schedule("note-on", note_on);
    this.schedule("note-off", note_off);
  }

  unschedule_all() {
    const transport = this.tone.getTransport();
    for (const event_id of this.event_ids) {
      transport.clear(event_id);
    }
    this.event_ids = [];
  }
}
