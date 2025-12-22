import { Rational } from "../Rational.js";
import { SoundSystem } from "../sound/SoundSystem.js";
import { Transport } from "../sound/Transport.js";
import { AnimationSystem } from "./AnimationSystem.js";

export class MusicalAnimation {
  /**
   * Constructor
   * @param {SoundSystem} sound Sound system for scheduling cues on the music timeline
   * @param {AnimationSystem} animation Animation system that manages the events
   */
  constructor(sound, animation) {
    this.sound = sound;
    this.animation = animation;

    this.event_ids = [];
  }

  /**
   * Get the underlying
   * @type {EventTarget}
   */
  get events() {
    return this.animation.events;
  }

  /**
   * Update the current time based on the
   * @param {Transport} transport
   */
  update(transport) {
    this.animation.update(transport.current_time);
  }

  /**
   * Schedule a list of cues
   * @param {string} cue_id ID of this cue channel
   * @param {[Rational, any][]} cues The cues to schedule.
   */
  schedule_cues(cue_id, cues) {
    for (const [start_time, data] of cues) {
      const event_id = this.sound.schedule(start_time, () => {
        this.animation.cue(cue_id, data);
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
