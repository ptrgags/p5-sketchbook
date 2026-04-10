import { Color } from "../sketchlib/Color.js";
import { HEIGHT, SCREEN_CENTER, WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Line } from "../sketchlib/pga2d/Line.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Motor } from "../sketchlib/pga2d/versors.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { DetectorPoint } from "./DetectorPoint.js";
import { LatticeVector } from "./LatticeVector.js";
import { XRaySimulation } from "./XRaySimulation.js";

const EPSILON = 1e-8;

const ORIGIN = new Point(WIDTH / 2, HEIGHT / 4);

const STYLE_XRAY = new Style({
  stroke: new Oklch(0.7, 0.1, 300),
  width: 4,
});

const INCOMING_BEAM = style(
  new LineSegment(new Point(0, HEIGHT / 4), ORIGIN),
  STYLE_XRAY,
);

const STYLE_MACHINE = new Style({
  stroke: Color.from_hex_code("#333333"),
  fill: Color.from_hex_code("#777777"),
});

const STYLE_MACHINE_LINES = new Style({
  stroke: Color.from_hex_code("#333333"),
  width: 4,
});

const STYLE_CRYSTAL = new Style({
  stroke: new Oklch(0.4, 0.1, 40),
  fill: new Oklch(0.7, 0.1, 40),
});

const EMITTER_THICKNESS = HEIGHT / 32;
const EMITTER = style(
  new PolygonPrimitive(
    [
      new Point(0, HEIGHT / 4 + EMITTER_THICKNESS),
      new Point(50, HEIGHT / 4 + EMITTER_THICKNESS),
      new Point(75, HEIGHT / 4),
      new Point(50, HEIGHT / 4 - EMITTER_THICKNESS),
      new Point(0, HEIGHT / 4 - EMITTER_THICKNESS),
    ],
    true,
  ),
  STYLE_MACHINE,
);

const GONIOMETER_RADIUS = 40;
const GONIOMETER_FRAME = style(
  [
    new Circle(ORIGIN, GONIOMETER_RADIUS),
    new LineSegment(
      ORIGIN.add(Direction.DIR_Y.scale(GONIOMETER_RADIUS)),
      SCREEN_CENTER,
    ),
  ],
  STYLE_MACHINE_LINES,
);

const DETECTOR_X = 400;
const DETECTOR_SEGMENT = style(
  new LineSegment(new Point(DETECTOR_X, 0), new Point(DETECTOR_X, HEIGHT / 2)),
  STYLE_MACHINE_LINES,
);
const DETECTOR_LINE = new Line(1, 0, DETECTOR_X);

const STYLE_DETECTED = new Style({
  fill: new Oklch(0.7, 0.1, 150),
});

// radius of the crystal from center to the corner in pixels
const CRYSTAL_RADIUS = 20;

// length of outgoing rays in pixels
const OUTGOING_RAY_LENGTH = 175;

export class XRayLab {
  /**
   * Constructor
   * @param {XRaySimulation} simulation
   */
  constructor(simulation) {
    this.simulation = simulation;

    simulation.events.addEventListener("change", (e) => {
      const { angle, newly_detected } = /** @type {CustomEvent} */ (e).detail;
      this.#update_crystal(angle);
      this.#update_rays(angle, newly_detected);
    });

    /**
     * Map of g_hk -> detected peaks. To avoid repeats as the crystal rotates
     * multiples of 360 degrees, DetectorPoint manages removing duplicates
     * @type {Map<LatticeVector, DetectorPoint>}
     */
    this.detected_peaks = new Map();

    this.outgoing_rays = style([], STYLE_XRAY);
    this.crystal = style([], STYLE_CRYSTAL);
    this.goniometer_bar = style([], STYLE_MACHINE_LINES);
    this.peaks = style([], STYLE_DETECTED);
    this.primitive = group(
      GONIOMETER_FRAME,
      this.goniometer_bar,
      INCOMING_BEAM,
      this.outgoing_rays,
      EMITTER,
      DETECTOR_SEGMENT,
      this.peaks,
      this.crystal,
    );
  }

  /**
   * Rotate the crystal
   * @param {number} angle
   */
  #update_crystal(angle) {
    // the simulation uses y-up coordinates so we need to reverse the angle
    const corner = Direction.from_angle(-angle + Math.PI / 4).scale(
      CRYSTAL_RADIUS,
    );
    const crystal = new PolygonPrimitive(
      [corner, corner.rot90(), corner.rot180(), corner.rot270()].map((x) =>
        ORIGIN.add(x),
      ),
      true,
    );
    this.crystal.regroup(crystal);

    // Also rotate the goniometer
    const offset_to_circle = corner.set_length(GONIOMETER_RADIUS);
    const bar = new LineSegment(
      ORIGIN.add(offset_to_circle),
      ORIGIN.add(offset_to_circle.neg()),
    );
    this.goniometer_bar.regroup(bar);
  }

  /**
   * Update the rays that diffract from the crystal.
   * @param {number} angle
   * @param {LatticeVector[]} newly_detected
   */
  #update_rays(angle, newly_detected) {
    const k_in = this.simulation.wavevector_in;
    const rotation = Motor.rotation(Point.ORIGIN, angle);

    const outgoing_rays = newly_detected.map((g) => {
      return this.#compute_ray_geometry(k_in, g, rotation);
    });
    this.outgoing_rays.regroup(...outgoing_rays);

    // We might have created new DetectorPoints in #compute_ray_geometry()
    // so update the group for rendering. DetectorPoint implements Primitive,
    // so we can just grab the map values.
    this.peaks.regroup(...this.detected_peaks.values());
  }

  /**
   * For a single lattice vector, compute the outgoing ray visualization. This
   * produces a line segment from the crystal to the detector (if on-screen)
   * or a vector in the direction of k_out if it misses the detector (or hits it
   * off-screen to avoid overlapping the other visualization)
   *
   * Side effect: If the scattered ray hits the detector, a peak
   * @param {Direction} k_in Incoming wavevector in cycles/angstrom
   * @param {LatticeVector} g_hk Detected lattice vector
   * @param {Motor} rotation Rotation motor for this frame
   * @returns {LineSegment | VectorPrimitive}
   */
  #compute_ray_geometry(k_in, g_hk, rotation) {
    const rotated_g = rotation.transform_dir(g_hk.wavevector);

    // k_out is the diffracted wavevector
    // g = k_out - k_in, so
    // k_out = k_in + g
    const k_out = k_in.add(rotated_g);

    const intersection = this.#pew_pew(k_out);
    if (intersection) {
      // Record the detected point
      const detector_point = this.detected_peaks.getOrInsertComputed(
        g_hk,
        () => new DetectorPoint(),
      );
      detector_point.add_peak(intersection);

      // Draw a line segment from the crystal to where it it the detector.
      return new LineSegment(ORIGIN, intersection);
    }

    // Corner case: vector.set_length() below doesn't work on zero vectors
    if (k_out.equals(Direction.ZERO)) {
      return new LineSegment(ORIGIN, ORIGIN);
    }

    const offset_tip = k_out.set_length(OUTGOING_RAY_LENGTH).flip_y();
    const tip = ORIGIN.add(offset_tip);
    return new VectorPrimitive(ORIGIN, tip);
  }

  /**
   * Shoot a scattered ray from the crystal towards the detector, computing the
   * intersection (if there is one)
   * @param {Direction} k_out The scattered ray
   * @returns {Point | undefined} If the scattered ray hits the detector (and is on-screen), the intersection point
   */
  #pew_pew(k_out) {
    // If the scattered ray isn't pointing to the right, it can't possibly
    // hit the detector. This check avoids computing intersections behind the
    // start of the ray for left-pointing vectors.
    if (k_out.x <= EPSILON) {
      return undefined;
    }

    // pew-pew! compute the intersection of the outgoing ray and the detector
    // in screen space using (projective) geometric algebra operations
    const trajectory = ORIGIN.join(k_out.flip_y());
    const intersection = trajectory.meet(DETECTOR_LINE);

    // If the intersection is visibile on the screen, return it
    if (
      intersection instanceof Point &&
      intersection.y >= 0 &&
      intersection.y < HEIGHT / 2
    ) {
      return intersection;
    }

    // The intersection was offscreen, so treat it the same as rays that
    // weren't in the direction of the detector
    return undefined;
  }
}
