import { group } from "../sketchlib/primitives/shorthand.js";
import { XRaySimulation } from "./XRaySimulation.js";

export class XRayLab {
  /**
   * Constructor
   * @param {XRaySimulation} simulation
   */
  constructor(simulation) {
    this.simulation = simulation;

    this.primitive = group();
  }
}
