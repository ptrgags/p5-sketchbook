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
const SCALE_FACTOR = 25;

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

    simulation.events.addEventListener(
      "change",
      (/** @type {CustomEvent} */ e) => {
        const { wavevectors, visible_wavevectors } = e.detail;
        this.update_lattice(wavevectors);
        this.update_visible(visible_wavevectors);
      },
    );

    // set of points representing the reciprocal lattice vectors g_hk
    this.lattice = style([], STYLE_LATTICE);

    this.wavelength = undefined;
    /**
     * @type {Point}
     */
    this.ewald_center = undefined;
    this.ewald_sphere = style([], STYLE_XRAY);
    this.update_ewald(simulation.wavelength);

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
   *
   * @param {number} wavelength Wavelength in angstrom
   */
  update_ewald(wavelength) {
    this.wavelength = wavelength;
    const radius_freq = 1 / wavelength;
    const radius_px = radius_freq * SCALE_FACTOR;
    this.ewald_center = ORIGIN.add(Direction.DIR_X.scale(-radius_px));
    this.ewald_sphere.regroup(new Circle(this.ewald_center, radius_px));
  }

  /**
   *
   * @param {Direction[]} wavevectors Wavevectors for the whole lattice in cycles/angstrom
   */
  update_lattice(wavevectors) {
    const points = wavevectors.map((g_hk) =>
      ORIGIN.add(g_hk.scale(SCALE_FACTOR).flip_y()),
    );
    this.lattice.regroup(...points);
  }

  /**
   *
   * @param {Direction[]} visible_wavevectors Wavevectors that will produce bragg peaks
   */
  update_visible(visible_wavevectors) {
    const lattice_vectors = visible_wavevectors.map((g_hk) => {
      return new VectorPrimitive(
        ORIGIN,
        ORIGIN.add(g_hk.scale(SCALE_FACTOR).flip_y()),
      );
    });
    this.intersections.regroup(...lattice_vectors);

    const k_in = Direction.DIR_X.scale(1 / this.wavelength);
    const scattered_vectors = visible_wavevectors.map((g_hk) => {
      const k_out = k_in.add(g_hk);
      return new VectorPrimitive(
        ORIGIN,
        ORIGIN.add(k_out.scale(SCALE_FACTOR).flip_y()),
      );
    });

    const k_in_vec = new VectorPrimitive(
      ORIGIN,
      ORIGIN.add(k_in.scale(SCALE_FACTOR).flip_y()),
    );
    this.visible_xrays.regroup(k_in_vec, ...scattered_vectors);
  }
}
