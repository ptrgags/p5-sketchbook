import { TAU, GOLDEN_ANGLE } from "../sketchlib/math_consts.js";

/**
 * A simple struct representing a color in the HSV color space
 * @typedef {Object} HSVColor
 * @property {number} hue The hue component from [0, 1]
 * @property {number} saturation The saturation component from [0, 1]
 * @property {number} value the value component from [0, 1]
 */

/**
 * A simple struct representing polar coordinates
 * @typedef {Object} PolarCoords
 * @property {number} r The radius
 * @property {number} theta The angle
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
   * Get a point in the Phyllotactic spiral. This is used both for computing
   * colors from the color wheel, but also for some of the spiral patterns in
   * some sketches.
   * @param {number} index Integer index into the Phyllotactic spiral from [0, N)
   * @returns {PolarCoords} The coordinates of the point in the unit circle. The angle will be reduced to be in the range [0, 2pi)
   */
  get_point(index) {
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

    return {
      r: radius,
      theta: angle % TAU,
    };
  }

  /**
   * Get a color from the color palette.
   * @param {number} index Integer index into the palette from [0, N)
   * @returns {HSVColor} the color
   */
  get_color(index) {
    const { r, theta } = this.get_point(index);

    const hue = theta / TAU;
    const saturation = r;
    const value = 1.0;

    return {
      hue,
      saturation,
      value,
    };
  }
}
