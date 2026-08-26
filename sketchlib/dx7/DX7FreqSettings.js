/**
 * Each operator has two modes for computing frequency. Ratio (most common)
 * sets the pitch as a multiple of the fundamental (pressed keyboard key).
 * Fixed sets a fixed value in Hertz
 * @enum {number}
 */
const DX7FreqMode = {
  RATIO: 0,
  FIXED: 1,
};

/**
 * Format the detune value like in Dexed
 * @param {number} detune
 * @returns {String}
 */
function format_detune(detune) {
  if (detune == 0) {
    return "";
  }

  if (detune < 0) {
    return ` ${detune}`;
  }

  return ` +${detune}`;
}

export class DX7FreqSettings {
  /**
   * Constructor
   * @param {DX7FreqMode} mode
   * @param {number} detune
   * @param {number} coarse
   * @param {number} fine
   */
  constructor(mode, detune, coarse, fine) {
    this.mode = mode;
    this.detune = detune;
    this.coarse = coarse;
    this.fine = fine;
  }

  /**
   * Format as a human-readable string like in Dexed
   * @returns {string}
   */
  toString() {
    const detune = this.detune - 7;

    if (this.mode === DX7FreqMode.RATIO) {
      const coarse = this.coarse === 0 ? 0.5 : this.coarse;
      const fine = this.fine;
      const ratio = coarse + fine;
      return `${ratio.toFixed(2)}${format_detune(detune)}`;
    }

    const power_of_10 = this.coarse % 4;
    const base_hz = 10 ** power_of_10;
    // By observing values in Dexed, I see that the fine knob is measured in
    // units of 10^(1/100). Kinda like cents but... in base 10. Is there a name
    // for that?
    const scale_factor = 10 ** (this.fine / 100);
    const hz = base_hz * scale_factor;

    return `${hz.toPrecision(6)} Hz ${format_detune(detune)}`;
  }
}

DX7FreqSettings.INIT = Object.freeze(
  new DX7FreqSettings(DX7FreqMode.RATIO, 0, 1, 0),
);
