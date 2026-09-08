/**
 * @enum {number}
 */
export const DX7LFOType = {
  TRIANGLE: 0,
  SAW_DOWN: 1,
  SAW_UP: 2,
  SQUARE: 3,
  SINE: 4,
  SAMPLE_AND_HOLD: 5,
};

/**
 * @typedef {{
 *  speed: number,
 *  delay: number,
 *  pitch_mod_depth: number,
 *  amp_mod_depth: number,
 *  pitch_mod_sensitivity: number,
 *  wave: DX7LFOType,
 *  keyboard_sync: boolean
 * }} DX7LFOOptions
 */

export class DX7LFO {
  /**
   * Constructor
   * @param {DX7LFOOptions} options
   */
  constructor(options) {
    this.speed = options.speed;
    this.delay = options.delay;
    this.pitch_mod_depth = options.pitch_mod_depth;
    this.amp_mod_depth = options.amp_mod_depth;
    this.pitch_mod_sensitivity = options.pitch_mod_sensitivity;
    this.wave = options.wave;
    this.keyboard_sync = options.keyboard_sync;
  }
}

DX7LFO.INIT = Object.freeze(
  new DX7LFO({
    speed: 35,
    delay: 0,
    pitch_mod_depth: 0,
    amp_mod_depth: 0,
    pitch_mod_sensitivity: 3,
    wave: DX7LFOType.TRIANGLE,
    keyboard_sync: true,
  }),
);
