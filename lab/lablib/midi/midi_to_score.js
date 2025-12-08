import { Score } from "../music/Score.js";
import { MIDIFile, MIDIMessage } from "./MidiFile.js";

/**
 * Do a cumulative sum to convert tick deltas to absolute time since the
 * start of the track
 * @param {import("./MidiFile").MIDIEvent[]} events The events to process
 * @return {[number, import("./MidiFile").MIDIEvent][]} (absolute_time, event)
 */
function deltas_to_absolute(events) {
  let time = 0;
  let result = [];
  for (const event of events) {
    /**
     * @type {[number, import("./MidiFile").MIDIEvent]}
     */
    const absolute = [time, event];
    result.push(absolute);
    time += event.tick_delta;
  }
  return result;
}

/**
 * Push a value to an object at the given key, creating an empty list
 * as needed.
 * @param {object} obj
 * @param {any} key
 * @param {any} value
 */
function create_push(obj, key, value) {
  if (Array.isArray(obj[key])) {
    obj[key].push(value);
  } else {
    obj[key] = [value];
  }
}

/**
 *
 * @param {[number, import("./MidiFile").MIDIEvent][]} abs_events MIDI events with absolute times.
 */
function split_by_channel(abs_events) {
  const result = {};

  for (const [time, event] of abs_events) {
    if (event instanceof MIDIMessage) {
      const channel = event.channel;
      create_push(result, channel, [time, event]);
    } else {
      create_push(result, "system", [time, event]);
    }
  }

  return result;
}

/**
 * Convert a MIDIFile object to a Score
 * @param {MIDIFile} midi the MIDI file object
 * @returns {Score}
 */
export function midi_to_score(midi) {
  console.log("converting midi to score:", midi);

  if (midi.header.format !== 0) {
    throw new Error(`Not yet implemented: format ${midi.header.format}`);
  }

  const ticks_per_quarter = midi.header.ticks_per_quarter;

  // TODO: Handle format 1 and 2 messages with multiple tracks
  const track = midi.tracks[0];
  const abs_timing = deltas_to_absolute(track.events);

  // split by channel number
  const by_channel = split_by_channel(abs_timing);
  console.log(by_channel);

  const parts = [];
  return new Score({
    parts,
  });
}
