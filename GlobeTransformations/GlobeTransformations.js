import { Cline } from "../sketchlib/cga2d/Cline.js";
import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { PowerIterator } from "../sketchlib/cga2d/PowerIterator.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";

// Map the unit circle to a circle at the center of the screen with radius 200 px
// Anything I want to render on the unit circle needs to be conjugated by this.
const TRANSLATE_CIRCLE_CENTER = CVersor.translation(
  new Direction(WIDTH / 2, HEIGHT / 2),
);
const SCALE_UP = CVersor.dilation(200);
const FLIP_Y = CVersor.reflection(Direction.DIR_Y);
const TO_SCREEN = TRANSLATE_CIRCLE_CENTER.compose(SCALE_UP).compose(FLIP_Y);

const hyp = CVersor.dilation(2);
const iter = new PowerIterator(hyp);

const PARALLELS = iter.iterate(-3, 3).map((x) => {
  const full_xform = TO_SCREEN.compose(x);
  return full_xform.transform(Cline.UNIT_CIRCLE);
});
const GEOM = style(PARALLELS, new Style({ stroke: Color.RED }));

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

    GEOM.draw(p);
  };
};
