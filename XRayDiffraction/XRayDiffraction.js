import { AnimationGroup } from "../sketchlib/animation/AnimationGroup.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { XRayLab } from "./XRayLab.js";
import { XRaySimulation } from "./XRaySimulation.js";
import { XRayWavevectors } from "./XRayWavevectors.js";

const SIMULATION = new XRaySimulation();
const LAB_ANIMATION = new XRayLab(SIMULATION);
const WAVEVECTORS = new XRayWavevectors(SIMULATION);

const SCENE = group(LAB_ANIMATION.primitive, WAVEVECTORS.primitive);

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

    SCENE.draw(p);
  };

  // TODO: input events
};
