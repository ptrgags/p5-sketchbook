// The frequencies will be in [-MAX_FREQ, MAX_FREQ] in both

import { griderator } from "../sketchlib/Grid.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Motor } from "../sketchlib/pga2d/versors.js";

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
    this.wavelength = 0.25;

    // I'm using linear wave vectors so the units are cycles/meter
    // not radians/meter. This skips the 2pi scaling factor that doesn't
    // actually matter for this simulation
    this.wavevector_in = new Direction(1 / this.wavelength, 0);
    this.wavevectors = ORIGINAL_WAVEVECTORS;
    this.visible_wavevectors = [];
  }

  update(angle) {
    const rotate = Motor.rotation(Point.ORIGIN, angle);

    this.angle = angle;
    this.wavevectors = ORIGINAL_WAVEVECTORS.map((x) => rotate.transform_dir(x));
    this.visible_wavevectors = this.wavevectors.filter((g_hk) => {
      // k_in is 1/wavelength in the +x direction
      // Since this is a case of elastic scattering, |k_out| = |k_in|
      // However, due to Laue-Bragg diffraction, we only get constructive
      // interference for frequencies (h, k) when g_hk = k_out - k_in

      // TODO: How is that equation connected to this circle intersection exactly?

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
