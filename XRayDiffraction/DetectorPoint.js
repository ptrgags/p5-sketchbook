import { Point } from "../sketchlib/pga2d/Point.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";

/**
 * @implements {Primitive}
 */
export class DetectorPoint {
  constructor() {
    /**
     * Map of sign(peak.y) -> peak
     * Since the input x-ray is horizontal, each spatial frequency will be
     * detected twice, once bending upwards, once bending downwards.
     * Storing the sign of the y-component is enough to distingush the two
     * peaks while avoiding duplicate detections.
     *
     * In the case of peaks exactly horizontal, this would give 0 as the key,
     * that works fine as well so there will only be 1 point stored after
     * deduplicating.
     * @type {Map<number, Point>}
     */
    this.peaks = new Map();
  }

  /**
   * Add a detected Bragg diffraction peak. This ignores duplicates.
   * @param {Point} bragg_peak The point where the x-ray hit the detector screen
   */
  add_peak(bragg_peak) {
    const key = Math.sign(bragg_peak.y);
    if (this.peaks.has(key)) {
      return;
    }
    this.peaks.set(key, bragg_peak);
  }

  /**
   * Draw 0-2 points depending on what was detected
   * @param {import('p5')} p p5 library
   */
  draw(p) {
    for (const point of this.peaks.values()) {
      point.draw(p);
    }
  }
}
