const TAU = 2 * Math.PI;
const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = TAU / (PHI * PHI);

/**
 * A simple struct representing a color in the HSV color space
 * @typedef {Object} HSVColor
 * @property {number} hue The hue component from [0, 1]
 * @property {number} saturation The saturation component from [0, 1]
 * @property {number} value the value component from [0, 1]
 */

/**
 * A color palette formed by taking a spiral phyllotaxis pattern (see Desmos
 * sketch here: https://www.desmos.com/calculator/wpgqaginov) and
 * superimposing it on the HSV color wheel.
 */
export class PhyllotaxisPalette {
  /**
   * Constructor
   * @param {number} primordia_count The number of primordia in the phyllotactic spiral
   */
  constructor(primordia_count) {
    if (primordia_count < 2) {
      throw new Error("primordia_count must be at least 2");
    }
    this.primordia_count = primordia_count;
  }

  /**
   * Get a color from the color palette.
   * @param {number} index Integer index into the palette from [0, N] (inclusive)
   * @returns {HSVColor} the color
   */
  get_color(index) {
    if (index < 0) {
      throw new Error("index must be nonnegative");
    }

    if (index >= this.primordia_count) {
      throw new Error(
        `index must be less than the palette length of ${this.primordia_count}`
      );
    }

    const angle = index * GOLDEN_ANGLE;
    const radius = 1.0 - index / (this.primordia_count - 1);

    const TAU = 2.0 * Math.PI;
    const hue = (angle % TAU) / TAU;
    const saturation = radius;
    const value = 1.0;

    return {
      hue,
      saturation,
      value,
    };
  }
}
