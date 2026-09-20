import { DX7LFO, DX7LFOType } from "../sketchlib/dx7/DX7LFO.js";
import { Tween } from "../sketchlib/Tween.js";

/**
 * @enum {number}
 */
export const OPMLFOWaveform = {
  SAW: 0,
  SQUARE: 1,
  TRIANGLE: 2,
  NOISE: 3,
};

// used for both amp and pitch mod depth
const MAP_DEPTH = Tween.scalar(0, 99, 0, 127);
const MAP_FREQ = Tween.scalar(0, 99, 0, 255);

/**
 *
 * @param {OPMLFOWaveform} opm_waveform
 * @returns {DX7LFOType}
 */
function to_dx7_waveform(opm_waveform) {
  switch (opm_waveform) {
    case OPMLFOWaveform.SAW:
      // TODO: Check this one against Furnace, the datasheet shows
      // both ramp and saw waveforms depending on pitch vs amplitude
      // modulation
      return DX7LFOType.SAW_DOWN;
    case OPMLFOWaveform.SQUARE:
      return DX7LFOType.SQUARE;
    case OPMLFOWaveform.TRIANGLE:
      return DX7LFOType.TRIANGLE;
    case OPMLFOWaveform.NOISE:
      return DX7LFOType.SAMPLE_AND_HOLD;
  }

  throw new Error("invalid waveform");
}

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

  to_dx7_lfo() {
    return new DX7LFO({
      wave: to_dx7_waveform(this.waveform),
      speed: MAP_FREQ.get_value(this.freq),
      amp_mod_depth: MAP_DEPTH.get_value(this.amp_mod_depth),
      pitch_mod_depth: MAP_DEPTH.get_value(this.pitch_mod_depth),
      // Unused in OPM; set to defaults
      keyboard_sync: true,
      delay: 0,
      pitch_mod_sensitivity: 3,
    });
  }
}
