import { Rational } from "../Rational.js";

export class Rest {
  /**
   * Constructor
   * @param {Rational} duration How long to rest
   */
  constructor(duration) {
    this.duration = duration;
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
}

/**
 * Notes arranged in a sequence in time.
 * @template P the pitch type
 */
export class Melody {
  /**
   * Constructor
   * @param {(Rest | Note<P>)[]} values Values to put in sequence
   */
  constructor(...values) {
    this.values = values;
  }

  get duration() {
    return this.values.reduce((accum, x) => {
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
    const new_values = this.values.map((x) => {
      if (x instanceof Note) {
        return new Note(convert_pitch(x.pitch), x.duration);
      }

      return x;
    });

    return new Melody(...new_values);
  }

  /**
   * Parse a melody from an array
   * @template P
   * @param  {...[P|undefined, Rational]} tuples either (pitch, duration) or (REST, duration)
   * @returns {Melody<P>} The parsed melody
   */
  static parse(...tuples) {
    const values = [];
    for (const tuple of tuples) {
      const [pitch, duration] = tuple;
      const note =
        pitch === undefined ? new Rest(duration) : new Note(pitch, duration);
      values.push(note);
    }

    return new Melody(...values);
  }
}
