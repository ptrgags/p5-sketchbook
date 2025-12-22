import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { CirclePrimitive } from "../../sketchlib/primitives/CirclePrimitive.js";
import { InvMask, Mask } from "../../sketchlib/primitives/ClipMask.js";
import { ClipPrimitive } from "../../sketchlib/primitives/ClipPrimitive.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { PointPrimitive } from "../../sketchlib/primitives/PointPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { VectorTangle } from "../../sketchlib/primitives/VectorTangle.js";
import { Style } from "../../sketchlib/Style.js";

const BIG_CIRCLE = new CirclePrimitive(new Point(250, 350), 100);
const BIG_CIRCLE_STYLE = new Style({ stroke: Color.MAGENTA, width: 8 });
const MID_LINE = new LinePrimitive(new Point(250, 0), new Point(250, 700));
const BIG_CIRCLE_DECO = style([BIG_CIRCLE, MID_LINE], BIG_CIRCLE_STYLE);

const LEFT_HALF = new RectPrimitive(new Point(0, 0), new Direction(250, 700));

const stripe_lines = [];
const STRIPE_STYLE = new Style({ stroke: Color.RED });
for (let i = 0; i < 50; i++) {
  const y = 200 + i * 10;
  stripe_lines.push(new LinePrimitive(new Point(0, y), new Point(500, y)));
}
const STRIPES = style(group(...stripe_lines), STRIPE_STYLE);

const RIGHT_HALF = new RectPrimitive(
  new Point(250, 0),
  new Direction(250, 700)
);

const SMALLER_CIRCLE = new CirclePrimitive(new Point(375, 400), 100);
const polka = [];
const POLKA_STYLE = new Style({ fill: Color.CYAN });
for (let i = 0; i < 10; i++) {
  const x = 250 + 50 * i;
  for (let j = 0; j < 10; j++) {
    const y = 345 + 50 * j;
    polka.push(new CirclePrimitive(new Point(x, y), 45 / 2));
  }
}
const POLKA = style(group(...polka), POLKA_STYLE);
const STYLE_SMALL_OUTLINE = new Style({
  stroke: Color.YELLOW,
  width: 5,
});
const SMALLER_OUTLINE = style(SMALLER_CIRCLE, STYLE_SMALL_OUTLINE);

const sine_dots = [];
for (let i = 0; i < 10; i++) {
  const x_center = 250 + i * 10;
  for (let j = 0; j < 300; j++) {
    const offset = 5 * Math.sin(2 * Math.PI * 1 * (j / 100));
    const y = 200 + j;
    sine_dots.push(new PointPrimitive(new Point(x_center + offset, y)));
  }
}

const SINE_STYLE = new Style({ fill: Color.GREEN });
const SINE_DUST = style(group(...sine_dots), SINE_STYLE);

const TANGLE = new ClipPrimitive(
  new Mask(BIG_CIRCLE),
  new VectorTangle(
    [
      [new Mask(LEFT_HALF), STRIPES],
      [
        new Mask(RIGHT_HALF),
        new VectorTangle(
          [
            [new Mask(SMALLER_CIRCLE), POLKA],
            [new InvMask(SMALLER_CIRCLE), SINE_DUST],
          ],
          SMALLER_OUTLINE
        ),
      ],
    ],
    BIG_CIRCLE_DECO
  )
);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );

    p.background(0);
    TANGLE.draw(p);
  };

  p.draw = () => {};
};
