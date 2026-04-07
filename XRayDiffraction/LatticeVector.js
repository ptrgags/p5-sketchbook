import { Direction } from "../sketchlib/pga2d/Direction.js";

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
   * @param {Direction} wavevector Computed wavevector for this lattice vector
   */
  constructor(h, k, wavevector) {
    this.h = h;
    this.k = k;
    this.wavevector = wavevector;
  }
}
