import { Point } from "../pga2d/objects.js";
import { clamp } from "./clamp.js";

/**
 * Lerp for numbers
 * @param {number} a The first number
 * @param {number} b The second number
 * @param {number} t The time value
 * @returns {number} The blend of a and b proportional to t
 */
function lerp(a, b, t) {
  return (1 - t) * a + t * b;
}

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
   * @param {function(T, T, number): T} lerp_func - the interpolation function for the value type
   * @param {number} start_time The start time. This can be in frames, seconds,
   * or some artificial animation time.
   * @param {number} duration The duration. It must be the same units as
   * start_time.
   */
  constructor(start_value, end_value, lerp_func, start_time, duration) {
    this.start_value = start_value;
    this.end_value = end_value;
    this.start_time = start_time;
    this.duration = duration;

    /**
     * @type {function(T, T, number): T}
     */
    this.lerp_func = lerp_func;
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
    const t = clamp(t_relative, 0.0, 1.0);
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
   * @returns {Tween<number>} A number-valued tween
   */
  static scalar(start_value, end_value, start_time, duration) {
    return new Tween(start_value, end_value, lerp, start_time, duration);
  }

  /**
   * Tween for animating a 2D PGA point
   * @param {Point} start_point The starting point
   * @param {Point} end_point The ending point
   * @param {number} start_time The start time in frames, seconds or other time units
   * @param {number} duration The end time in the same units as start_time
   * @returns {Tween<Point>} A point-valued tween
   */
  static point(start_point, end_point, start_time, duration) {
    return new Tween(start_point, end_point, Point.lerp, start_time, duration);
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
