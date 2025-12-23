import { Rational } from "../Rational.js";
import { SoundSystem } from "../sound/SoundSystem.js";

export class MusicalCues {
  /**
   * Constructor
   * @param {SoundSystem} sound Sound system for scheduling cues on the music timeline
   */
  constructor(sound) {
    this.sound = sound;
    this.cues = new EventTarget();
    this.event_ids = [];
  }

  /**
   * Schedule a list of cues
   * @param {string} cue_id ID of this cue channel
   * @param {[Rational, any][]} cues The cues to schedule.
   */
  schedule_cues(cue_id, cues) {
    for (const [start_time, data] of cues) {
      const event_id = this.sound.schedule(start_time, () => {
        this.cues.dispatchEvent(new CustomEvent(cue_id, { detail: data }));
      });
      this.event_ids.push(event_id);
    }
  }

  /**
   * Unschedule all the cues scheduled via schedule_cues()
   */
  unschedule_cues() {
    this.sound.unschedule(this.event_ids);
  }
}
