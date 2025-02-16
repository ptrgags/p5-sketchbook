import { GOLDEN_ANGLE } from "../sketchlib/math_consts.js";
import { Polar } from "../sketchlib/Polar.js";

/**
 * One of the points in the phyllotactic spiral. It is created in the center
 * of the inflorescence, and is pushed outwards
 */
export class Primordium {
  /**
   * Constructor
   * @param {number} index Index of this primordium within the phyllotactic spiral.
   * @param {number} start_time Start time of the animation in frames
   * @param {number} start_size Initial size of the primordium in pixels.
   * @param {number} speed Speed at which the primordium is pushed outwards in pixels/frame
   * @param {number} growth_rate Growth rate in pixels/frame
   */
  constructor(index, start_time, start_size, speed, growth_rate) {
    this.index = index;
    this.start_time = start_time;
    this.start_size = start_size;
    this.speed = speed;
    this.growth_rate = growth_rate;

    // Each primordium moves in a straight line radially, so the angle
    // is const
    this.angle = index * GOLDEN_ANGLE;
  }

  /**
   * Get the position of the primordium as it gets pushed outwards
   * from the center of the inflorescence.
   * @param {number} time The current animation time in frames
   * @returns {Polar | undefined} The current position in polar coordinates, or undefined if the time is less than the start time.
   */
  get_position(time) {
    if (time < this.start_time) {
      return undefined;
    }

    const distance = (time - this.start_time) * this.speed;
    return new Polar(distance, this.angle);
  }

  /**
   * Get the size of the primordium which grows linearly with time.
   * @param {number} time The current animation time in frames
   * @returns {number | undefined} The size of the primordium in pixels, or undefined if the time is less than the start time.
   */
  get_size(time) {
    if (time < this.start_time) {
      return undefined;
    }

    return this.start_size + (time - this.start_time) * this.growth_rate;
  }
}
