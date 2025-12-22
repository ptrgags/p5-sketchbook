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
   * @type {EventTarget}
   */
  get cues() {
    return this.animation.cues;
  }

  /**
   * @type {number}
   */
  get time() {
    return this.animation.time;
  }

  /**
   * Get the current value of the given curve
   * @param {string} curve_id Curve ID
   * @return {number} The current curve value
   */
  get_curve_val(curve_id) {
    return this.animation.get_curve_val(curve_id);
  }

  /**
   * Update the current time, this will affect get_curve() for this frame
   * @param {number} time The current transport time
   */
  update(time) {
    this.animation.update(time);
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
