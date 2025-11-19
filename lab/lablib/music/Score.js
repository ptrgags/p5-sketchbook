import { Rational } from "../Rational.js";
import { REST } from "./pitches.js";
import { Gap, Parallel, Sequential, timeline_map } from "./Timeline.js";

/**
 * Pitched note. The choice of pitch space can vary
 * @template P The pitch type
 */
export class Note {
  /**
   * Constructor
   * @param {P} pitch Pitch
   * @param {Rational} duration The duration
   */
  constructor(pitch, duration) {
    this.pitch = pitch;
    this.duration = duration;
  }

  /**
   * Map the pitch type to a new type
   * @template Q The new pitch type
   * @param {function(P): Q} convert_pitch Function to convert pitch types
   * @return {Note<Q>} A new alternation with pitches of the destination type
   */
  map_pitch(convert_pitch) {
    return new Note(convert_pitch(this.pitch), this.duration);
  }
}

// Musical aliases.
export const Rest = Gap;

/**
 * @template P
 * @typedef {Sequential<Note<P>>} Melody<P>
 */
export const Melody = Sequential;

/**
 * Parse a melody from an array
 * @template P
 * @param  {...[P|undefined, Rational]} tuples either (pitch, duration) or (REST, duration)
 * @returns {Melody<P>} The parsed melody
 */
export function parse_melody(...tuples) {
  const children = [];
  for (const tuple of tuples) {
    const [pitch, duration] = tuple;
    const note =
      pitch === undefined ? new Rest(duration) : new Note(pitch, duration);
    children.push(note);
  }

  return new Melody(...children);
}

/**
 * @template P
 * @typedef {Parallel<Note<P>>} Harmony<P>
 */
export const Harmony = Parallel;

/**
 * Parse a cycle from an array as in Tidal Cycles. Though the result is
 * turned into a Melody
 * @example
 * const cycle = parse_cycle(N1, [C4, D4, [E4, F4], G4]);
 * @template P
 * @param {Rational} cycle_length Length of one cycle
 * @param  {(P | P[])[]} notes List of pitch values or arrays thereof. Arrays are interpreted as nested cycles
 * @returns {Melody<P>} The cycle expanded as a melody
 */
export function parse_cycle(cycle_length, notes) {
  const children = [];
  const subdivision = new Rational(1, notes.length);
  const beat_length = cycle_length.mul(subdivision);
  for (const note of notes) {
    let child;
    if (note === REST) {
      child = new Rest(subdivision);
    } else if (Array.isArray(note)) {
      // Interpret arrays
      child = parse_cycle(beat_length, note);
    } else {
      // Numbers are interpreted as notes as long as the cycle length
      child = new Note(note, subdivision);
    }

    children.push(child);
  }

  return new Melody(...children);
}

/**
 * @template P
 * @typedef {import("./Timeline.js").Timeline<Note<P>>} Music<P>
 */

/**
 * Adjust pitches everywhere for the given musical material. This is handy
 * for tasks like converting pitch format (e.g. scale degree to absolute pitch)
 * or transposition.
 * @template P The old pitch type
 * @template Q The new pitch type
 * @param {function(P):Q} pitch_func A function to convert pitch formats
 * @param {Music<P>} music The musical material
 */
export function map_pitch(pitch_func, music) {
  return timeline_map(
    (note) => new Note(pitch_func(note.pitch), note.duration),
    music
  );
}

/**
 * @typedef {string} Instrument
 */

/**
 * A score is a container for music with instruments labeled.
 * @template P
 */
export class Score {
  /**
   * Constructor
   * @param  {...[Instrument, Music<P>]} parts
   */
  constructor(...parts) {
    this.parts = parts;
  }
}
