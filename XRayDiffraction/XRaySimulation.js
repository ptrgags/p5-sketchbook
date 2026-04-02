import { is_nearly } from "../sketchlib/is_nearly.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Motor } from "../sketchlib/pga2d/versors.js";

// The frequencies will be in [-MAX_FREQ, MAX_FREQ] in both
// dimensions
const MAX_FREQ = 10;

/**
 * @type {Direction[]}
 */
const ORIGINAL_WAVEVECTORS = [];
for (let i = -MAX_FREQ; i <= MAX_FREQ; i++) {
  for (let j = -MAX_FREQ; j <= MAX_FREQ; j++) {
    const wavevector = new Direction(i, j);
    ORIGINAL_WAVEVECTORS.push(wavevector);
  }
}

export class XRaySimulation {
  constructor() {
    this.events = new EventTarget();

    this.angle = 0;

    // Wavelength in angstroms. Smaller means more
    // Bragg peaks will be visible
    this.wavelength = 1 / 4;

    // I'm using linear wave vectors so the units are cycles/meter
    // not radians/meter. This skips the 2pi scaling factor that doesn't
    // actually matter for this simulation
    this.wavevector_in = new Direction(1 / this.wavelength, 0);
    this.wavevectors = ORIGINAL_WAVEVECTORS;
    this.visible_wavevectors = [];
  }

  /**
   * When the angle of the crystal changes, call this method to update the
   * simulation
   * @param {number} angle
   */
  update(angle) {
    const rotate = Motor.rotation(Point.ORIGIN, angle);

    this.angle = angle;
    this.wavevectors = ORIGINAL_WAVEVECTORS.map((x) => rotate.transform_dir(x));
    this.visible_wavevectors = this.wavevectors.filter((g_hk) => {
      // k_in is 1/wavelength in the +x direction
      // Since this is a case of elastic scattering, |k_out| = |k_in|
      // So it could scatter in any direction, but the length of the wavevector
      // will match that of the incoming x-ray. In other words, k_out
      // will be somewhere on the circle |k_out - k_in| = |k_in|

      // However, due to Laue-Bragg diffraction, we only get constructive
      // interference for frequencies (h, k) when g_hk = k_out - k_in. So
      // we need to see where the lattice point intersects the wavevector.
      const length_sqr = g_hk.sub(this.wavevector_in).mag_sqr();
      return is_nearly(
        length_sqr,
        1 / (this.wavelength * this.wavelength),
        1e-3,
      );
    });

    this.events.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          wavelength: this.wavelength,
          angle: this.angle,
          wavevectors: this.wavevectors,
          visible_wavevectors: this.visible_wavevectors,
        },
      }),
    );
  }
}
