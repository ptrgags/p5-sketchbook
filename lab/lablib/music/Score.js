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
 */
export class Melody {
  /**
   * Constructor
   * @param {(Rest | Note)[]} values Values to put in sequence
   */
  constructor(values) {
    this.values = values;
  }

  get duration() {
    return this.values.reduce((accum, x) => {
      return accum.add(x.duration);
    }, Rational.ZERO);
  }
}
