import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { ExpandCollapseParallels } from "./ExpandCollapseParallels.js";

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const EXPAND_COLLAPSE = new ExpandCollapseParallels(2, 5, TO_SCREEN);

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

    const t = p.frameCount / 60;

    EXPAND_COLLAPSE.update(t);

    EXPAND_COLLAPSE.primitive.draw(p);

    //GEOM.draw(p);
  };
};
