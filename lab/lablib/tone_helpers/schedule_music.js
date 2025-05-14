import { Cycle, Gap, Loop, Parallel, Sequential } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";

/**
 * Schedule a cropped version of the loop's child.
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset The start of the loop in the overall timeline
 * @param {Rational} crop_duration The desired length after cropping
 * @param {Loop<T>} loop The loop to crop
 * @returns {[T, string, string][]} The event(s) to schedule for the cropped loop
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
 * Schedule a loop repeating to the end. This will produce several entries
 * for the same event with different start/end times.
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset Starting of the first loop in the overall timeline
 * @param {Loop<T>} loop The loop to repeat
 * @returns {[T, string, string][]} The events to schedule from the repeated loop.
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
 * Schedule a loop, repeating/cropping as necessary
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset The start of the first loop in the overall timeline
 * @param {Loop<T>} loop The loop to schedule
 * @returns {[T, string, string][]} The events for this loop
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
 * @param {Rational} offset The start of the cycle in the overall timeline
 * @param {Cycle<T>} cycle The cycle to schedule
 * @returns {[T, string, string][]} The scheduled events
 */
function schedule_cycle(offset, cycle) {
  throw new Error("not implemented: complex cycle");
}

/**
 * Schedule clips, producing a list of events and start/end times.
 * @template {import("../music/Timeline.js").TimeInterval} T
 * @param {Rational} offset Start of the music in the overall timeline
 * @param {import("../music/Timeline").Timeline<T>} clips The music clips to schedule
 * @return {[T, string, string][]} Sequence of events to schedule
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
