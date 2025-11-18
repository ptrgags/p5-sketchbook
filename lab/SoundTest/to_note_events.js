import { Harmony, Melody, MusicCycle, Note } from "../lablib/music/Score.js";
import { Gap, Loop } from "../lablib/music/Timeline.js";
import { Rational } from "../lablib/Rational.js";

function merge_events(events) {
  // TODO: merge the n lists sorted by time
  throw new Error("Not yet implemented");
}

function concat_events(music_array) {
  let offset = Rational.ZERO;

  const results = [];
  for (const child of music_array) {
    const raw_events = to_note_events(child);
    const shifted_events = raw_events.map(([duration, event_type, pitch]) => {
      return [duration.add(offset), event_type, pitch];
    });
    results.push(...shifted_events);
    offset = offset.add(child.duration);
  }
  return results;
}

/**
 *
 * @param {import("../lablib/music/Score").Music<number>} music
 */
export function to_note_events(music) {
  if (music instanceof Gap) {
    return [];
  }

  if (music instanceof Note) {
    const note_on = [Rational.ZERO, "on", music.pitch];
    const note_off = [music.duration, "off", music.pitch];
    return [note_on, note_off];
  }

  if (music instanceof Melody) {
    return concat_events(music.children);
  }

  if (music instanceof Harmony) {
    const events = music.children.map(to_note_events);
    return merge_events(events);
  }

  if (music instanceof MusicCycle) {
    const events = music.children.map(to_note_events);
    throw new Error("not yet implemented");
  }

  if (music instanceof Loop) {
    const loop_events = to_note_events(music.child);
    throw new Error("not yet implemented");
  }
}
