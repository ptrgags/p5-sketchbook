import { Rational } from "../Rational.js";
import { REST } from "./pitches.js";

export class Rest {
  /**
   * Constructor
   * @param {Rational} duration How long to rest
   */
  constructor(duration) {
    this.duration = duration;
  }

  /**
   * A rest does not have any pitches, so map_pitch is the identity
   * @return {Rest} A new alternation with pitches of the destination type
   */
  map_pitch() {
    return this;
  }
}

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

/**
 * Notes arranged in a sequence in time.
 * @template P the pitch type
 */
export class Melody {
  /**
   * Constructor
   * @param {...Music<P>} children Inner musical material
   */
  constructor(...children) {
    this.children = children;
  }

  get duration() {
    return this.children.reduce((accum, x) => {
      return accum.add(x.duration);
    }, Rational.ZERO);
  }

  /**
   * Map the pitch type to a new type
   * @template Q The new pitch type
   * @param {function(P): Q} convert_pitch
   * @return {Melody<Q>} A new melody with pitches of the destination type
   */
  map_pitch(convert_pitch) {
    const converted = this.children.map((x) => x.map_pitch(convert_pitch));
    return new Melody(...converted);
  }

  /**
   * Parse a melody from an array
   * @template P
   * @param  {...[P|undefined, Rational]} tuples either (pitch, duration) or (REST, duration)
   * @returns {Melody<P>} The parsed melody
   */
  static parse(...tuples) {
    const children = [];
    for (const tuple of tuples) {
      const [pitch, duration] = tuple;
      const note =
        pitch === undefined ? new Rest(duration) : new Note(pitch, duration);
      children.push(note);
    }

    return new Melody(...children);
  }
}

/**
 * Musical material played simultaneously. Note that this will only sound
 * correctly when played with a polyphonic instrument.
 * @template P
 */
export class Harmony {
  /**
   * Constructor
   * @param  {...Music<P>} children
   */
  constructor(...children) {
    this.children = children;
  }

  /**
   * Map the pitch type to a new type
   * @template Q The new pitch type
   * @param {function(P): Q} convert_pitch
   * @return {Harmony<Q>} A new harmony with pitches of the destination type
   */
  map_pitch(convert_pitch) {
    const converted = this.children.map((x) => x.map_pitch(convert_pitch));
    return new Harmony(...converted);
  }

  /**
   * Compute the duration as the max of the children's durations
   * @type {number}
   */
  get duration() {
    return this.children.reduce((accum, x) => Math.max(accum, x.duration), 0);
  }
}

/**
 * A fixed length loop of time that is evenly divided amongst its children.
 * This is based on cycles from Tidal Cycles.
 * @see {@link https://tidalcycles.org/docs/reference/cycles|Tidal Cycles Reference}
 * @template P
 */
export class Cycle {
  /**
   * Constructor
   * @param {Rational} duration The duration of 1 cycle
   * @param  {...Music<P>} children Children music objects. Each one will receive the same fraction of a cycle
   */
  constructor(duration, ...children) {
    this.duration = duration;
    this.children = children;
    this.subdivision = new Rational(1, children.length);
  }

  /**
   * Map the pitch type to a new type
   * @template Q The new pitch type
   * @param {function(P): Q} convert_pitch
   * @return {Cycle<Q>} A new cycle with pitches of the destination type
   */
  map_pitch(convert_pitch) {
    const converted = this.children.map((x) => x.map_pitch(convert_pitch));
    return new Cycle(this.duration, ...converted);
  }

  /**
   * Parse a cycle from an array
   * @example
   * const cycle = Cycle.parse(N1, [C4, D4, [E4, F4], G4]);
   * @template P
   * @param {Rational} cycle_length Length of one cycle
   * @param  {(P | P[])[]} notes List of pitch values or arrays thereof. Arrays are interpreted as nested cycles
   * @returns {Cycle<P>} The comuted cyles
   */
  static parse(cycle_length, notes) {
    const children = [];
    const subdivision = new Rational(1, notes.length);
    const beat_length = cycle_length.mul(subdivision);
    for (const note of notes) {
      let child;
      if (note === REST) {
        child = new Rest(subdivision);
      } else if (Array.isArray(note)) {
        // Interpret arrays
        child = Cycle.parse(beat_length, note);
      } else {
        // Numbers are interpreted as notes as long as the cycle length
        child = new Note(note, subdivision);
      }

      children.push(child);
    }

    return new Cycle(cycle_length, ...children);
  }
}

/**
 * A collection of musical material. Each time the parent container loops,
 * The next option from the list is selected (cycling around at the end)
 *
 * This is inspired by the alternation notation in Tidal Cycles
 * @see {@link https://tidalcycles.org/docs/reference/mini_notation|Tidal Cycles Reference}
 * @template P
 */
export class Alternation {
  /**
   * constructor
   * @param  {...Music<P>} children Musical material treated as options to select from
   */
  constructor(...children) {
    this.children = children;
  }

  /**
   * The duration of an alternation is a bit ambiguous, I choose to use the
   * maximum length of the children, similar to Harmony
   * @type {number}
   */
  get duration() {
    return this.children.reduce((accum, x) => Math.max(accum, x.duration), 0);
  }

  /**
   * Map the pitch type to a new type
   * @template Q The new pitch type
   * @param {function(P): Q} convert_pitch Function to convert pitch types
   * @return {Alternation<Q>} A new alternation with pitches of the destination type
   */
  map_pitch(convert_pitch) {
    const converted = this.children.map((x) => x.map_pitch(convert_pitch));
    return new Harmony(...converted);
  }
}

/**
 * Fixed-length clip of music. If it is longer than its contents,
 * the contents are played on loop for the given duration. If it is shorter
 * than its contents, only part of the music will be played
 * @template P
 */
export class Clip {
  /**
   * Constructor
   * @param {Rational} duration The length of the clip (this can be different)
   * @param {Music<P>} child The musical content of the clip
   */
  constructor(duration, child) {
    this.duration = duration;
    this.child = child;
  }

  /**
   * Map the pitch type to a new type
   * @template Q The new pitch type
   * @param {function(P): Q} convert_pitch Function to convert pitch types
   * @return {Clip<Q>} A new clip with pitches of the destination type
   */
  map_pitch(convert_pitch) {
    return new Clip(this.duration, this.child.map_pitch(convert_pitch));
  }
}

/**
 * @template P
 * @typedef {Rest | Note<P> | Melody<P> | Harmony<P> | Cycle<P> | Alternation<P> | Clip<P>} Music<P>
 */

/**
 * @typedef {number} Instrument
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
