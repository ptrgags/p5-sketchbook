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
  const events = to_events(offset, clips);
  return events.map(([x, start, end]) => [
    x,
    to_tone_time(start),
    to_tone_time(end),
  ]);
}
