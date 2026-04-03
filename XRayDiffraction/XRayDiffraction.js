import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { XRayLab } from "./XRayLab.js";
import { XRaySimulation } from "./XRaySimulation.js";
import { XRayReciprocalSpace } from "./XRayReciprocalSpace.js";

const SIMULATION = new XRaySimulation();
const LAB_ANIMATION = new XRayLab(SIMULATION);
const WAVEVECTORS = new XRayReciprocalSpace(SIMULATION);

const STYLE_BACKDROP = new Style({
  fill: Color.BLACK,
});
const BACKDROP = style(
  new RectPrimitive(Point.ORIGIN, new Direction(WIDTH, HEIGHT / 2)),
  STYLE_BACKDROP,
);

const SCENE = group(WAVEVECTORS.primitive, BACKDROP, LAB_ANIMATION.primitive);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );

    SIMULATION.update(0);
  };

  p.draw = () => {
    p.background(0);

    const angle = (p.frameCount / 600) * 2 * Math.PI;
    SIMULATION.update(angle);

    SCENE.draw(p);
  };

  // TODO: input events
};
