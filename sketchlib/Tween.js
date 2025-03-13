import { Point } from "../pga2d/objects.js";
import { clamp } from "./clamp.js";

function lerp_number(a, b, t) {
  return (1 - t) * a + t * b;
}

/**
 * @template T
 */
export class Tween {
  /**
   * Create a tween to interpolate between the start and end value. Right now
   * this only supports linear interpolation
   * @param {T} start_value The initial value
   * @param {T} end_value
   * @param {number} start_time
   * @param {number} duration
   */
  constructor(start_value, end_value, lerp_func, start_time, duration) {
    this.start_value = start_value;
    this.end_value = end_value;
    this.start_time = start_time;
    this.duration = duration;

    /**
     * @type {function}
     */
    this.lerp_func = lerp_func;
  }

  get end_time() {
    return this.start_time + this.duration;
  }

  is_done(time) {
    return time > this.end_time;
  }

  get_value(time) {
    const t_relative = (time - this.start_time) / this.duration;
    const t = clamp(t_relative, 0.0, 1.0);
    return this.lerp_func(this.start_value, this.end_value, t);
  }

  restart(new_start, new_duration) {
    this.start_time = new_start;
    this.duration = new_duration;
  }

  static scalar(start_value, end_value, start_time, duration) {
    return new Tween(start_value, end_value, lerp_number, start_time, duration);
  }

  static point(start_point, end_point, start_time, duration) {
    return new Tween(start_point, end_point, Point.lerp, start_time, duration);
  }

  /**
   * Make a tween that measures elapsed time from the start time.
   * @param {number} start_time The start time in frames or seconds
   * @param {number} duration The duration in frames or seconds. This must match the units of start_time
   * @returns {Tween<number>} A tween that goes from [0, duration] in the units of the input
   */
  static elapsed_timer(start_time, duration) {
    return new Tween(0, duration, lerp_number, start_time, duration);
  }
}

export function sec_to_frames(sec) {
  return sec * 60;
}

export function frames_to_sec(frames) {
  return frames / 60;
}
