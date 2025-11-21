import { Gap, Parallel, Sequential } from "../music/Timeline.js";
import { Rational } from "../Rational.js";
import { to_tone_time } from "./measure_notation.js";

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
  } else {
    // Plain interval
    const start = offset;
    const end = start.add(clips.duration);
    const start_time = to_tone_time(start);
    const end_time = to_tone_time(end);
    return [[clips, start_time, end_time]];
  }
}
