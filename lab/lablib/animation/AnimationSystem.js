import { ParamCurve } from "../music/ParamCurve.js";

export class AnimationSystem {
  constructor() {
    this.cues = new EventTarget();
    this.time = 0;
  }

  /**
   * Update the current time for this frame
   * @param {number} time Current time
   */
  update(time) {
    this.time = time;
  }

  /**
   *
   * @param {string} curve_id ID of the
   * @param {import("../music/Timeline").Timeline<ParamCurve>} curve
   */
  register_curve(curve_id, curve) {}

  /**
   * Get the value of a parameter
   * @param {string} curve_id ID of the parameter curve
   * @returns {number | undefined} The value of the parameter, or undefined if not set
   */
  get_curve_val(curve_id) {
    return undefined;
  }

  /**
   * Trigger a cue event
   * @param {string} cue_id ID for this cue event
   * @param {any} detail Data to include in the cue
   */
  cue(cue_id, detail) {
    this.cues.dispatchEvent(new CustomEvent(cue_id, { detail }));
  }
}
