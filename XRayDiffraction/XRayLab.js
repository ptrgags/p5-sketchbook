import { Color } from "../sketchlib/Color.js";
import { HEIGHT, SCREEN_CENTER, WIDTH } from "../sketchlib/dimensions.js";
import { is_nearly } from "../sketchlib/is_nearly.js";
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

const DETECTOR_X = 350;
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
      const rotated_g = rotation.transform_dir(g.wavevector);

      // g = k_out - k_in, so k_out = k_in + g
      const k_out = k_in.add(rotated_g);

      if (k_out.equals(Direction.ZERO)) {
        return new LineSegment(ORIGIN, ORIGIN);
      }

      // Shoot a ray out of the crystal in the direction of
      // k_out, but skip to pixels
      const dir_out = k_out.set_length(OUTGOING_RAY_LENGTH).flip_y();
      return new LineSegment(ORIGIN, ORIGIN.add(dir_out));
    });
    this.outgoing_rays.regroup(...outgoing_rays);
  }

  /**
   *
   * @param {Direction} k_in Incoming wavevector in cycles/angstrom
   * @param {LatticeVector} g_hk Detected lattice vector
   * @param {Motor} rotation Rotation motor for this frame
   * @returns {LineSegment | VectorPrimitive | undefined}
   */
  #pew_pew(k_in, g_hk, rotation) {
    const rotated_g = rotation.transform_dir(g_hk.wavevector);

    // k_out is the diffracted wavevector
    // g = k_out - k_in, so
    // k_out = k_in + g
    const k_out = k_in.add(rotated_g);

    // Will the scattered ray hit the detector? only rays moving to the right
    // will even have a chance of this happening
    if (k_out.x > EPSILON) {
      const trajectory = ORIGIN.join(k_out);
      const intersection = trajectory.meet(DETECTOR_LINE);

      // Here we only want points that are visible in the top half of the screen
      if (
        intersection instanceof Point &&
        intersection.y >= 0 &&
        intersection.y < HEIGHT / 2
      ) {
        const detector_point = this.detected_peaks.getOrInsertComputed(
          g_hk,
          () => new DetectorPoint(),
        );
        detector_point.add_peak(intersection);

        return new LineSegment(ORIGIN, intersection);
      }
    }

    // The ray either doesn't intersect the detector, or intersects offscreen.
    // either way, draw it as a direction vector instead
    if (k_out.equals(Direction.ZERO)) {
      return new LineSegment(ORIGIN, ORIGIN);
    }

    const tip = k_out.set_length(OUTGOING_RAY_LENGTH).to_point();
    return new LineSegment(ORIGIN, tip);
  }
}
