const NEAR_INSTANT = 0.005;

/**
 * Attack, Decay, Sustain, Release envelope
 *
 * This class provides a few static methods to more easily describe
 * common envelope shapes
 */
export class ADSR {
  /**
   * Constructor
   * @param {number} attack Attack time in seconds
   * @param {number} decay Decay time in seconds
   * @param {number} sustain Sustain level in [0, 1]
   * @param {number} release Release time in seconds
   */
  constructor(attack, decay, sustain, release) {
    this.attack = attack;
    this.decay = decay;
    this.sustain = sustain;
    this.release = release;
  }

  /**
   * Shorthand for a pluck envelope with instant attack and equal
   * decay and release (configurable)
   * @param {number} decay Decay/release time in seconds
   * @returns {ADSR}
   */
  static pluck(decay) {
    return new ADSR(NEAR_INSTANT, decay, 0, decay);
  }

  /**
   * Shorthand for an envelope that swells - long attack and decay.
   * I'm setting release to the same as decay
   * @param {number} attack Attack time in seconds
   * @param {number} release Release time in seconds
   * @returns {ADSR}
   */
  static swell(attack, release) {
    return new ADSR(attack, release, 0, release);
  }

  /**
   * Shorthand for an envelope that has an instant attack
   * and configurable release time
   * @param {number} release Release time in seconds
   * @returns {ADSR}
   */
  static organ(release) {
    return new ADSR(NEAR_INSTANT, 0, 1, release);
  }
}
// Default is an organ envelope
ADSR.DEFAULT = Object.freeze(ADSR.organ(1));
// (near instant) attack, sustain at max level, (near) instant release
ADSR.DIGITAL = Object.freeze(new ADSR(NEAR_INSTANT, 0, 1, NEAR_INSTANT));
