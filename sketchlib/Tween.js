import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { clamp } from "./clamp.js";
import { Ease } from "./Ease.js";
import { lerp } from "./lerp.js";

/**
 * An object to manage inbetweening for animation
 * @template T
 */
export class Tween {
  /**
   * Create a tween to interpolate between the start and end value. Right now
   * this only supports linear interpolation.
   *
   * This constructor should not be used directly, see static functions like
   * Tween.scalar and Tween.point
   * @param {T} start_value The initial value
   * @param {T} end_value The end value
   * @param {number} start_time The start time. This can be in frames, seconds,
   * or some artificial animation time.
   * @param {number} duration The duration. It must be the same units as
   * start_time.
   * @param {function(T, T, number): T} lerp_func - the interpolation function for the value type
   * @param {function(number): number} [easing_curve = Ease.identity] - Easing curve from [0, 1] to [0, 1] for adjusting the flow of the animation
   */
  constructor(
    start_value,
    end_value,
    start_time,
    duration,
    lerp_func,
    easing_curve = Ease.identity
  ) {
    this.start_value = start_value;
    this.end_value = end_value;
    this.start_time = start_time;
    this.duration = duration;

    /**
     * @type {function(T, T, number): T}
     */
    this.lerp_func = lerp_func;
    this.easing_curve = easing_curve;
  }

  /**
   * The computed end time from start time and duration
   * @type {number}
   */
  get end_time() {
    return this.start_time + this.duration;
  }

  /**
   * Check if the animation is finished
   * @param {number} time The current time in the units as start_time
   * @returns {boolean} True if the current time is greater than end_time
   */
  is_done(time) {
    return time > this.end_time;
  }

  /**
   * Get the value at a given time
   * @param {number} time The current time in the same units as start_time. If it is out of range, it is clamped into range
   * @returns {T} the current value of the tween
   */
  get_value(time) {
    const t_relative = (time - this.start_time) / this.duration;
    const t_linear = clamp(t_relative, 0.0, 1.0);
    const t = this.easing_curve(t_linear);
    return this.lerp_func(this.start_value, this.end_value, t);
  }

  /**
   * Restart the animation with a new start time and duration
   * @param {number} new_start The new start time
   * @param {number} new_duration The new duration
   */
  restart(new_start, new_duration) {
    this.start_time = new_start;
    this.duration = new_duration;
  }

  /**
   * Tween for animating a scalar parameter
   * @param {number} start_value The starting value
   * @param {number} end_value The ending value
   * @param {number} start_time The start time in frames, seconds or other time units
   * @param {number} duration The end time in the same units as start_time
   * @param {function(number): number} [easing_curve = Ease.identity] - Easing curve from [0, 1] to [0, 1] for adjusting the flow of the animation
   * @returns {Tween<number>} A number-valued tween
   */
  static scalar(
    start_value,
    end_value,
    start_time,
    duration,
    easing_curve = Ease.identity
  ) {
    return new Tween(
      start_value,
      end_value,
      start_time,
      duration,
      lerp,
      easing_curve
    );
  }

  /**
   * Tween for animating a 2D PGA point
   * @param {Point} start_point The starting point
   * @param {Point} end_point The ending point
   * @param {number} start_time The start time in frames, seconds or other time units
   * @param {number} duration The end time in the same units as start_time
   * @param {function(number): number} [easing_curve = Ease.identity] - Easing curve from [0, 1] to [0, 1] for adjusting the flow of the animation
   * @returns {Tween<Point>} A point-valued tween
   */
  static point(
    start_point,
    end_point,
    start_time,
    duration,
    easing_curve = Ease.identity
  ) {
    return new Tween(
      start_point,
      end_point,
      start_time,
      duration,
      Point.lerp,
      easing_curve
    );
  }

  /**
   * Tween for animating a 2D PGA direction
   * @param {Direction} start_dir The starting direction
   * @param {Direction} end_dir The ending direction
   * @param {number} start_time The start time in frames, seconds or other time units
   * @param {number} duration The end time in the same units as start_time
   * @param {function(number): number} [easing_curve = Ease.identity] - Easing curve from [0, 1] to [0, 1] for adjusting the flow of the animation
   * @returns {Tween<Direction>} A direction-valued tween
   */
  static dir(
    start_dir,
    end_dir,
    start_time,
    duration,
    easing_curve = Ease.identity
  ) {
    return new Tween(
      start_dir,
      end_dir,
      start_time,
      duration,
      Direction.lerp,
      easing_curve
    );
  }

  /**
   * Make a tween that measures elapsed time starting at start_time
   * @param {number} start_time The start time in frames or seconds
   * @param {number} duration The duration in frames or seconds. This must match the units of start_time
   * @returns {Tween<number>} A tween that goes from [0, duration] in the units of the input
   */
  static elapsed_timer(start_time, duration) {
    return Tween.scalar(0, duration, start_time, duration);
  }
}

/**
 * Convert seconds to frames assuming the ideal frame rate of 60 FPS
 * @param {number} sec Number of seconds
 * @returns {number} The corresponding number of frames (continuous)
 */
export function sec_to_frames(sec) {
  return sec * 60;
}

/**
 * Convert from frames to seconds, assuming the ideal frame rate of 60 FPS
 * @param {number} frames Number of frames
 * @returns {number} equivalent seconds assuming 60 FPS
 */
export function frames_to_sec(frames) {
  return frames / 60;
}
