import { ParamCurve } from "./ParamCurve.js";

export class AnimationSystem {
  /**
   * Constructor
   * @param {{[curve_id: string]: import("../music/Timeline").Timeline<ParamCurve>}} curves
   */
  constructor(curves) {
    this.time = 0;

    /**
     * @type {Map<string, AnimationCurve>}
     */
    this.curves = new Map();

    for (const [curve_id, curve] of Object.entries(curves)) {
      this.register_curve(curve_id, curve);
    }
  }

  /**
   * Update the current time for this frame
   * @param {number} time Current time
   */
  update(time) {
    this.time = time;
  }

  /**
   * Add an animation curve
   * @param {string} curve_id ID to refer to this curve in get_curve_val
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
}
