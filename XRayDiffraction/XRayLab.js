import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Line } from "../sketchlib/pga2d/Line.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { PolygonPrimitive } from "../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { XRaySimulation } from "./XRaySimulation.js";

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

const DETECTOR_LINE = new Line(1, 0, 400);

// radius of the crystal from center to the corner in pixels
const CRYSTAL_RADIUS = 30;

export class XRayLab {
  /**
   * Constructor
   * @param {XRaySimulation} simulation
   */
  constructor(simulation) {
    this.simulation = simulation;

    simulation.events.addEventListener(
      "change",
      (/** @type {CustomEvent} */ e) => {
        this.update_crystal(e.detail.angle);
        this.update_rays(e.detail.wavelength, e.detail.visible_wavevectors);
      },
    );

    this.outgoing_rays = style([], STYLE_XRAY);
    this.crystal = style([], STYLE_CRYSTAL);
    this.primitive = group(
      INCOMING_BEAM,
      this.outgoing_rays,
      EMITTER,
      DETECTOR_LINE,
      this.crystal,
    );
  }

  /**
   *
   * @param {number} angle
   */
  update_crystal(angle) {
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
  }

  /**
   *
   * @param {Direction[]} visible_wavevectors
   */
  update_rays(wavelength, visible_wavevectors) {
    const k_in = new Direction(1 / wavelength, 0);
    const outgoing_rays = visible_wavevectors.map((g_hk) => {
      // g = k_out - k_in, so k_out = k_in + g
      const k_out = k_in.add(g_hk);

      // Shoot a ray out of the crystal in the direction of
      // k_out, but skip to pixels
      const dir_out = k_out.set_length(200);
      return new LineSegment(ORIGIN, ORIGIN.add(dir_out));
    });
    this.outgoing_rays.regroup(...outgoing_rays);
  }
}
