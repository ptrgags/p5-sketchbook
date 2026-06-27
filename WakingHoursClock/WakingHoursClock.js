import { WallClock } from "../sketchlib/animation/WallClock.js";
import { ArcAngles } from "../sketchlib/ArcAngles.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { ArcPrimitive } from "../sketchlib/primitives/ArcPrimitive.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

const DIAL_RADIUS = 200;

const HOUR_WAKE = 6;
const HOUR_SLEEP = 22;

const ANGLES_WAKE = new ArcAngles(
  WallClock.compute_angle(HOUR_WAKE, 24),
  WallClock.compute_angle(HOUR_SLEEP, 24),
);

const ARC_WAKE = new ArcPrimitive(SCREEN_CENTER, DIAL_RADIUS, ANGLES_WAKE);

const STYLE_WAKE = new Style({
  stroke: Color.CYAN,
  width: 8,
});

const SCENE = style(ARC_WAKE, STYLE_WAKE);

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
  };

  p.draw = () => {
    p.background(0);

    SCENE.draw(p);
  };
};
