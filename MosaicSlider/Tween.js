import { Point } from "../pga2d/objects.js";
import { clamp } from "../sketchlib/clamp.js";

export class Tween {
  constructor(start_value, end_value, start_time, duration) {
    this.start_value = start_value;
    this.end_value = end_value;
    this.start_time = start_time;
    this.duration = duration;
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
    return Point.lerp(this.start_value, this.end_value, t);
  }
}

export function sec_to_frames(sec) {
  return sec * 60;
}

export function frames_to_sec(frames) {
  return frames / 60;
}
