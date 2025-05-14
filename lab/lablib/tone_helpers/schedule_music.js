import { Cycle, Gap, Loop, Parallel, Sequential } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";

/**
 * Schedule a cropped version of the loop's child.
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset
 * @param {Rational} crop_duration
 * @param {Loop<T>} loop
 * @returns {[T, string, string][]}
 */
function crop_loop(offset, crop_duration, loop) {
  const { duration, child } = loop;

  if (child instanceof Gap) {
    // No events to schedule
    return [];
  }

  if (child instanceof Sequential) {
    throw new Error("not implemented: crop sequential");
  }

  if (child instanceof Parallel) {
    throw new Error("not implemented: crop parallel");
  }

  if (child instanceof Loop) {
    throw new Error("not implemented: crop nested loop");
  }

  if (child instanceof Cycle) {
    throw new Error("not implemented: crop nested loop");
  }

  // child is type T
  const start = offset;
  const end = start.add(crop_duration);
  const start_time = to_tone_time(start);
  const end_time = to_tone_time(end);
  return [[child, start_time, end_time]];
}

/**
 * Schedule a loop repeating to the end
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset
 * @param {Loop<T>} loop
 * @returns {[T, string, string][]}
 */
function repeat_loop(offset, loop) {
  const { duration, child } = loop;

  const schedule = [];

  const full_repeats = Math.floor(duration.real / child.duration.real);
  for (let i = 0; i < full_repeats; i++) {
    const repeat_offset = offset.add(child.duration.mul(new Rational(i, 1)));
    const child_clips = schedule_clips(repeat_offset, child);
    schedule.push(...child_clips);
  }

  if (full_repeats * child.duration.real < duration.real) {
    const repeat_duration = child.duration.mul(new Rational(full_repeats, 1));
    const remaining_duration = duration.sub(repeat_duration);
    const end_offset = offset.add(repeat_duration);
    const cropped_last = crop_loop(end_offset, remaining_duration, loop);
    schedule.push(...cropped_last);
  }

  return schedule;
}

/**
 *
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset
 * @param {Loop<T>} loop
 * @returns {[T, string, string][]}
 */
function schedule_loop(offset, loop) {
  const { duration, child } = loop;
  if (duration.real < child.duration.real) {
    return crop_loop(offset, duration, loop);
  } else if (duration.real > child.duration.real) {
    return repeat_loop(offset, loop);
  }

  return schedule_clips(offset, child);
}

/**
 * Schedule a cycle of inner clips
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset
 * @param {Cycle<T>} clips
 * @returns {[T, string, string][]}
 */
function schedule_cycle(offset, clips) {
  throw new Error("not implemented: complex cycle");
}

/**
 * Schedule clips
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset
 * @param {import("../music/Timeline").Timeline<T>} clips
 * @return {[T, string, string][]} Sequence of clips to schedule.
 */
export function schedule_clips(offset, clips) {
  if (clips instanceof Gap) {
    return [];
  } else if (clips instanceof Sequential) {
    let start = offset;
    const schedule = [];
    for (const child of clips.children) {
      const clips = schedule_clips(start, child);
      schedule.push(...clips);
      start = start.add(child.duration);
    }
    return schedule;
  } else if (clips instanceof Parallel) {
    return clips.children.flatMap((x) => schedule_clips(offset, x));
  } else if (clips instanceof Loop) {
    return schedule_loop(offset, clips);
  } else if (clips instanceof Cycle) {
    return schedule_cycle(offset, clips);
  } else {
    // Plain interval
    const start = offset;
    const end = start.add(clips.duration);
    const start_time = to_tone_time(start);
    const end_time = to_tone_time(end);
    return [[clips, start_time, end_time]];
  }
}
