import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
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

const STYLE_INTERSECTION = new Style({
  fill: new Oklch(0.7, 0.1, 100),
});

const STYLE_G_HK = new Style({
  stroke: new Oklch(0.7, 0.1, 100),
  width: 2,
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
      const { lattice, newly_detected, ewald_sphere } =
        /** @type {CustomEvent}*/ (e).detail;
      this.#update_lattice(lattice);
      this.#update_newly_detected(newly_detected);
      this.#update_ewald(ewald_sphere);
    });

    // set of points representing the reciprocal lattice vectors g_hk
    this.lattice = style([], STYLE_LATTICE);

    this.ewald_sphere = style([], STYLE_XRAY);

    // Reciprocal lattice vectors that intersect the sphere, colored in yellow.
    this.intersections = style([], STYLE_G_HK);

    // wavevectors that are detectable. This includes both the incoming beam
    // and the scattered rays.
    this.visible_xrays = style([], STYLE_XRAY);
    this.primitive = group(
      AXES,
      this.ewald_sphere,
      this.visible_xrays,
      this.lattice,
      this.intersections,
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
   *
   * @param {LatticeVector[]} lattice Wavevectors for the whole lattice in cycles/angstrom
   */
  #update_lattice(lattice) {
    const points = lattice.map((g) =>
      ORIGIN.add(g.wavevector.scale(PIXELS_PER_FREQ).flip_y()),
    );
    this.lattice.regroup(...points);
  }

  /**
   *
   * @param {LatticeVector[]} newly_detected Wavevectors that were detected since the last frame.
   */
  #update_newly_detected(newly_detected) {
    const detected_vectors = newly_detected.map(
      (g) =>
        new VectorPrimitive(
          ORIGIN,
          ORIGIN.add(g.wavevector.scale(PIXELS_PER_FREQ).flip_y()),
        ),
    );
    this.intersections.regroup(...detected_vectors);

    const k_in = this.simulation.wavevector_in;
    const scattered_vectors = newly_detected.map((g) => {
      const k_out = k_in.add(g.wavevector);
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
