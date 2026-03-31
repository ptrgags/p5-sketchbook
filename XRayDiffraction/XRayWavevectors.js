import { Color } from "../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Oklch } from "../sketchlib/Oklch.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { XRaySimulation } from "./XRaySimulation.js";

const STYLE_AXES = new Style({
  stroke: Color.WHITE,
});

const STYLE_XRAY = new Style({
  stroke: new Oklch(0.7, 0.1, 300),
});

const STYLE_INTERSECTION = new Style({
  stroke: new Oklch(0.7, 0.1, 100),
});

const ORIGIN = new Point(WIDTH / 2, (3 * HEIGHT) / 4);
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

export class XRayWavevectors {
  /**
   * Constructor
   * @param {XRaySimulation} simulation
   */
  constructor(simulation) {
    this.simulation = simulation;

    simulation.events.addEventListener(
      "change",
      (/** @type {CustomEvent} */ e) => {
        // TODO: update simulation
      },
    );

    this.wavevectors = group();
    this.ewald_sphere = style([], STYLE_XRAY);
    this.intersections = style([], STYLE_INTERSECTION);
    this.primitive = group(AXES, this.ewald_sphere, this.wavevectors);
  }
}
