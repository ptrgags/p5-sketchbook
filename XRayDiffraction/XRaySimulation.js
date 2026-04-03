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
      // The incoming x-ray has a constant wavelength in the +x direction,
      // so we can say:
      //
      // k_in = 1/wavelength x
      //
      // i.e. 1/wavelength cycles/angstrom in the x-direction

      // With elastic scattering, the scattered light will have the same
      // energy and therefore same wavelength and spatial frequency. In other
      // words, |k_out| = |k_in|. so k_out must live on a circle with radius
      // 1/wavelength centered at the origin. i.e.
      //
      // k_out(theta) = 1/wavelength * exp(theta * xy)

      // However, since the x-rays scatter off many different planes of the
      // crystal lattice, you're adding together many possible k_out, so in
      // many cases you will get destructive interference. The Laue equations
      // determine when constructive interference happens (and therefore a
      // detectable scattered beam):
      //
      // For spatial frequency (h, k), constructive interference happens when
      // the reciprocal lattice vector g_hk satisfies
      // g_hk = delta_k = k_out - k_in
      //
      // delta_k = k_out(theta) - k_in = 1/wavelength * exp(theta * xy) - 1/wavelength
      // delta_k = 1/wavelength * (exp(theta * xy) - 1)
      //
      // this is still and equation for a circle of radius 1/wavelength, but
      // now it's shifted to the left to be centered at -1/wavelength x.

      // This means we're trying to intersect a point g_hk with the shifted
      // circle (center: -1/wavelength, radius: 1/wavelength)
      //
      // |g_hk - (-1/wavelength x)| = 1/wavelength
      // |g_hk + 1/wavelength x| = 1/wavelength
      // or, to avoid the square roots:
      // |g_hk + 1/wavelength x|^2 = 1/wavelength^2

      // This is the condition we test for to see if the spatial frequency
      // will produce a detectable scattered beam.
      const length_sqr = g_hk.sub(this.wavevector_in.neg()).mag_sqr();
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
