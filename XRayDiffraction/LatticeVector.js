import { Direction } from "../sketchlib/pga2d/Direction.js";

// For now, assume the simplest lattice
// where
const BASIS_A = Direction.DIR_X;
const BASIS_B = Direction.DIR_Y;

/**
 * A point in the reciprocal lattice g_hk
 * measured in cycles/angstrom in the x and y
 * direction.
 */
export class LatticeVector {
  /**
   * Constructor
   * @param {number} h Miller index for x-axis (not necessarily in lowest terms!)
   * @param {number} k Miller index for y-axis (not necessarily in lowest terms!)
   */
  constructor(h, k) {
    this.h = h;
    this.k = k;

    /**
     * Lattice vector g_hk in cycles/angstrom
     * @type {Direction}
     */
    this.wavevector = BASIS_A.scale(h).add(BASIS_B.scale(k));
  }
}
