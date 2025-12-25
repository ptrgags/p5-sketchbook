import { Point } from "../../pga2d/Point.js";
import { Motor } from "../../pga2d/versors.js";

/**
 * Helper class for animating a point that sways back and forth
 * as if on a hinge.
 */
export class Hinge {
  /**
   * Constructor
   * @param {Point} anchor Anchor point that the position hinges around
   * @param {Point} position Starting point for the point that moves
   * @param {number} amplitude Amplitude of the hinge in radians
   * @param {number} frequency Frequency that the hinge will sway in cycles/unit time
   * @param {number} [phase=0] Start angle of swaying in radians
   */
  constructor(anchor, position, amplitude, frequency, phase = 0) {
    this.anchor = anchor;
    this.position = position;
    this.frequency = frequency;
  }

  /**
   * Make the position swing back and forth around the center
   * @param {number} time Elapsed time
   */
  update(time) {
    const angle = Math.sin(2 * Math.PI * this.frequency * time);
    const rotation = Motor.rotation(this.anchor, angle);
    this.position = rotation.transform_point(this.position);
  }
}
