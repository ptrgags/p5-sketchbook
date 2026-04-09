import { is_nearly } from "../sketchlib/is_nearly.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Motor } from "../sketchlib/pga2d/versors.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LatticeVector } from "./LatticeVector.js";

/**
 * @type {[Direction, Direction]}
 */
const DEFAULT_BASIS = [Direction.DIR_X, Direction.DIR_Y];

/**
 * Build a grid of lattice vectors
 * @param {[Direction, Direction]} basis basis vectors for reciprocal lattice in cycles/angstrom
 * @returns {LatticeVector[]} Array of lattice vectors
 */
function make_lattice(basis) {
  const [a, b] = basis;
  const lattice = [];
  const MAX_FREQ = 10;
  for (let h = -MAX_FREQ; h <= MAX_FREQ; h++) {
    for (let k = -MAX_FREQ; k <= MAX_FREQ; k++) {
      const g_hk = a.scale(h).add(b.scale(k));
      lattice.push(new LatticeVector(h, k, g_hk));
    }
  }

  return lattice;
}

export class XRaySimulation {
  /**
   * Construtor
   * @param {[Direction, Direction]} basis vectors for the reciprocal basis in cycles/angstrom
   */
  constructor(basis = DEFAULT_BASIS) {
    this.events = new EventTarget();

    /**
     * @type {LatticeVector[]}
     */
    this.lattice = make_lattice(basis);

    // Wavelength in angstroms. Smaller means more
    // Bragg peaks will be visible
    this.wavelength = 1 / 4;

    // I'm using linear wave vectors so the units are cycles/meter
    // not radians/meter. This skips the 2pi scaling factor that doesn't
    // actually matter for this simulation
    this.wavevector_in = new Direction(1 / this.wavelength, 0);
    this.ewald_sphere = new Circle(
      new Point(-1 / this.wavelength, 0),
      1 / this.wavelength,
    );

    /**
     * @type {Set<LatticeVector>}
     */
    this.detected = new Set();

    this.prev_angle = 0;
    this.curr_angle = 0;
  }

  /**
   * When the angle of the crystal changes, call this method to update the
   * simulation
   * @param {number} angle new angle for this frame
   */
  update(angle) {
    // Update the state
    this.prev_angle = this.curr_angle;
    this.curr_angle = angle;

    const rotate_prev = Motor.rotation(Point.ORIGIN, this.prev_angle);
    const rotate_curr = Motor.rotation(Point.ORIGIN, this.curr_angle);

    // Rotate the lattice to match the orientation of the crystal
    const rotated_lattice = this.lattice.map((x) =>
      rotate_curr.transform_dir(x.wavevector),
    );

    const sphere_center = this.ewald_sphere.center.to_direction();
    const radius_sqr = this.ewald_sphere.radius * this.ewald_sphere.radius;
    const newly_detected = this.lattice.filter((g) => {
      const prev_g = rotate_prev.transform_dir(g.wavevector);
      const curr_g = rotate_curr.transform_dir(g.wavevector);

      // Determine signed (squared) distance from the ewald sphere's surface.
      // + means we're outside the sphere, - means we're inside, 0 means on
      // the sphere.
      const prev_dist = prev_g.sub(sphere_center).mag_sqr() - radius_sqr;
      const curr_dist = curr_g.sub(sphere_center).mag_sqr() - radius_sqr;

      // If the sign changed since the last frame, then the lattice point
      // crossed the surface of the sphere. Most of the time, this happens
      // in between frames.
      const crossed_sphere = Math.sign(prev_dist) !== Math.sign(curr_dist);

      // We want intersections between the lattice and the Ewald sphere, but
      // in practice we also need to check for cases where the intersection
      // happened between frames.
      return is_nearly(curr_dist, 0) || crossed_sphere;
    });

    newly_detected.forEach((x) => this.detected.add(x));

    this.events.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          angle: this.curr_angle,
          ewald_sphere: this.ewald_sphere,
          lattice: this.lattice,
          newly_detected,
        },
      }),
    );
  }
}
