import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Motor } from "../sketchlib/pga2d/versors.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { LatticeVector } from "./LatticeVector.js";
import { XRaySimulation } from "./XRaySimulation.js";

const STYLE_AXES = new Style({
  stroke: Color.WHITE,
});

const STYLE_XRAY = new Style({
  stroke: new Oklch(0.7, 0.1, 300),
  width: 2,
});

const STYLE_LATTICE = new Style({
  fill: Color.from_hex_code("#6f0000"),
});

const STYLE_DETECTED = new Style({
  fill: new Oklch(0.7, 0.1, 150),
});

const STYLE_NEWLY_DETECTED = new Style({
  fill: new Oklch(0.7, 0.1, 100),
});

const ORIGIN = new Point(WIDTH / 2, (3 * HEIGHT) / 4);
// how many pixels per (cycle/angstrom) unit of the lattice
const PIXELS_PER_FREQ = 25;

const AXES = style(
  [
    new LineSegment(
      ORIGIN.add(Direction.DIR_X.scale(-150)),
      ORIGIN.add(Direction.DIR_X.scale(150)),
    ),
    new LineSegment(
      ORIGIN.add(Direction.DIR_Y.scale(-150)),
      ORIGIN.add(Direction.DIR_Y.scale(150)),
    ),
  ],
  STYLE_AXES,
);

export class XRayReciprocalSpace {
  /**
   * Constructor
   * @param {XRaySimulation} simulation
   */
  constructor(simulation) {
    this.simulation = simulation;

    simulation.events.addEventListener("change", (e) => {
      const { lattice, angle, newly_detected, ewald_sphere } =
        /** @type {CustomEvent}*/ (e).detail;
      this.#update_lattice(angle, lattice, new Set(newly_detected));
      this.#update_newly_detected(angle, newly_detected);
      this.#update_ewald(ewald_sphere);
    });

    // set of points representing the reciprocal lattice vectors g_hk
    this.lattice = style([], STYLE_LATTICE);
    this.lattice_detected = style([], STYLE_DETECTED);
    this.lattice_newly_detected = style([], STYLE_NEWLY_DETECTED);

    this.ewald_sphere = style([], STYLE_XRAY);

    // wavevectors that are detectable. This includes both the incoming beam
    // and the scattered rays.
    this.visible_xrays = style([], STYLE_XRAY);
    this.primitive = group(
      AXES,
      this.ewald_sphere,
      this.visible_xrays,
      this.lattice,
      this.lattice_detected,
      this.lattice_newly_detected,
    );
  }

  /**
   * Update the visual for the ewald sphere
   * @param {Circle} ewald_sphere ewald_sphere in reciprocal space
   */
  #update_ewald(ewald_sphere) {
    const radius_px = ewald_sphere.radius * PIXELS_PER_FREQ;
    const center_px = ORIGIN.add(Direction.DIR_X.scale(-radius_px));
    const ewald_px = new Circle(center_px, radius_px);
    this.ewald_sphere.regroup(ewald_px);
  }

  /**
   * @param {number} angle Rotation angle for the lattice
   * @param {LatticeVector[]} lattice Wavevectors for the whole lattice in cycles/angstrom
   * @param {Set<LatticeVector>} newly_detected Wavevectors detected since the previous frame
   */
  #update_lattice(angle, lattice, newly_detected) {
    const newly = [];
    const detected = [];
    const rest = [];

    const all_detected = this.simulation.detected;

    const rotate = Motor.rotation(Point.ORIGIN, angle);
    for (const g of lattice) {
      const rotated_g = rotate.transform_dir(g.wavevector);
      const point = ORIGIN.add(rotated_g.scale(PIXELS_PER_FREQ).flip_y());

      if (newly_detected.has(g)) {
        newly.push(new Circle(point, 10));
      } else if (all_detected.has(g)) {
        detected.push(point);
      } else {
        rest.push(point);
      }
    }

    this.lattice_newly_detected.regroup(...newly);
    this.lattice_detected.regroup(...detected);
    this.lattice.regroup(...rest);
  }

  /**
   *
   * @param {number} angle The current angle
   * @param {LatticeVector[]} newly_detected Wavevectors that were detected since the last frame.
   */
  #update_newly_detected(angle, newly_detected) {
    const motor = Motor.rotation(Point.ORIGIN, angle);

    const k_in = this.simulation.wavevector_in;
    const scattered_vectors = newly_detected.map((g) => {
      const rotated_g = motor.transform_dir(g.wavevector);
      const k_out = k_in.add(rotated_g);
      return new VectorPrimitive(
        ORIGIN,
        ORIGIN.add(k_out.scale(PIXELS_PER_FREQ).flip_y()),
      );
    });

    const k_in_vec = new VectorPrimitive(
      ORIGIN,
      ORIGIN.add(k_in.scale(PIXELS_PER_FREQ).flip_y()),
    );
    this.visible_xrays.regroup(k_in_vec, ...scattered_vectors);
  }
}
