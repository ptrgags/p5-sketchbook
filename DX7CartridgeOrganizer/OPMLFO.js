/**
 * @enum {number}
 */
export const OPMLFOWaveform = {
  SAW: 0,
  SQUARE: 1,
  TRIANGLE: 2,
  NOISE: 3,
};

/**
 * @typedef {{
 *  freq: number,
 *  amp_mod_depth: number,
 *  pitch_mod_depth: number,
 *  waveform: OPMLFOWaveform,
 *  noise_freq: number,
 * }} OPMLFOOptions
 */

export class OPMLFO {
  /**
   * Constructor
   * @param {OPMLFOOptions} options
   */
  constructor(options) {
    this.freq = options.freq;
    this.amp_mod_depth = options.amp_mod_depth;
    this.pitch_mod_depth = options.pitch_mod_depth;
    this.waveform = options.waveform;
    this.nose_freq = options.noise_freq;
  }
}
