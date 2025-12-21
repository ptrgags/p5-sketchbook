import { Direction } from "../../pga2d/Direction.js";
import { Point } from "../../pga2d/Point.js";
import { Color } from "../../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";
import { CirclePrimitive } from "../../sketchlib/primitives/CirclePrimitive.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { LinePrimitive } from "../../sketchlib/primitives/LinePrimitive.js";
import { PointPrimitive } from "../../sketchlib/primitives/PointPrimitive.js";
import { Primitive } from "../../sketchlib/primitives/Primitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { Style } from "../../sketchlib/Style.js";

class ClipPrimitive {
  /**
   * Constructor
   * @param {[Primitive, boolean][]} masks Pairs of (mask, inverted). The masks will be intersected to get the final clip mask. To union masks together, just have the mask render multiple shapes. To invert a mask, set the inverted flag for that mask.
   * @param {Primitive} child
   */
  constructor(masks, child) {
    this.masks = masks;
    this.child = child;
  }

  /**
   *
   * @param {Primitive} mask
   * @param {Primitive} child
   * @returns
   */
  static simple(mask, child) {
    return new ClipPrimitive([[mask, false]], child);
  }

  // Shorthand for a single innverted mask
  /**
   *
   * @param {Primitive} mask
   * @param {Primitive} child
   * @returns
   */
  static inverted(mask, child) {
    return new ClipPrimitive([[mask, true]], child);
  }

  /**
   * Draw the clipped primitive
   * @param {import("p5")} p p5 drawing context
   */
  draw(p) {
    // pushing is important here - there's no way to clear stenciled
    // pixels except through pop(). See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip
    p.push();

    // Make the clip mask as the intersection of all the masks.
    for (const [mask, inverted] of this.masks) {
      p.beginClip({ inverted });
      mask.draw(p);
      p.endClip();
    }

    // Draw the child
    this.child.draw(p);
    p.pop();
  }
}

const BIG_CIRCLE = new CirclePrimitive(new Point(250, 350), 100);

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

const SMALLER_CIRCLE = new CirclePrimitive(new Point(375, 400), 200);
const polka = [];
const POLKA_STYLE = new Style({ fill: Color.CYAN });
for (let i = 0; i < 10; i++) {
  const x = 250 + 50 * i;
  for (let j = 0; j < 10; j++) {
    const y = 345 + 50 * j;
    polka.push(new CirclePrimitive(new Point(x, y), 45));
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

const TANGLE = ClipPrimitive.simple(
  BIG_CIRCLE,
  group(
    ClipPrimitive.simple(LEFT_HALF, STRIPES),
    ClipPrimitive.simple(
      RIGHT_HALF,
      group(
        ClipPrimitive.simple(SMALLER_CIRCLE, POLKA),
        ClipPrimitive.inverted(SMALLER_CIRCLE, SINE_DUST),
        SMALLER_OUTLINE
      )
    )
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
  };

  p.draw_old = () => {
    p.background(0);

    // Oh yikes, I see that you can't nest begin/end clip calls: https://github.com/processing/p5.js/blob/main/src/core/p5.Renderer.js#L107
    // For the source code for beginClip/endClip, see https://github.com/processing/p5.js/blob/main/src/core/p5.Renderer2D.js#L174

    // Draw a partial circle inside another one
    p.push();
    p.beginClip();
    p.circle(250, 350, 200);
    p.endClip();

    p.fill(255, 0, 0);
    p.circle(300, 400, 150);
    p.pop();

    // Draw a rectangle cut by the union of two circles
    p.push();
    p.beginClip();
    p.circle(25, 25, 50);
    p.circle(50, 25, 50);
    p.endClip();

    p.fill(255, 0, 0);
    p.rect(0, 10, 100, 10);
    p.pop();

    // inverted clipping mask
    p.push();
    p.beginClip({ invert: true });
    p.circle(100, 100, 25);
    p.endClip();

    p.rect(75, 75, 300, 100);
    p.pop();

    // subsequent calls to beginClip() intersect the primitives
    // See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/clip
    p.push();
    p.beginClip();
    p.circle(100, 400, 100);
    p.endClip();

    p.beginClip();
    p.circle(150, 400, 100);
    p.endClip();

    p.rect(50, 300, 100, 200);

    p.pop();

    //p.circle(100, 400, 50);
    //p.circle(150, 400, 50);

    p.background(0);

    /*

    circle(
        left_half(
            stripes
        ),
        right_half(
            circle(

            )
            not circle(
            )

        )
    )

     */

    // Draw everything in a big circle
    p.push();
    p.beginClip();
    p.circle(250, 350, 200);
    p.endClip();

    // left half of circle: draw stripes in red
    p.push();
    p.beginClip();
    p.rect(0, 0, 250, 700);
    p.endClip();

    // start stripes
    p.push();
    p.stroke(255, 0, 0);
    for (let i = 0; i < 50; i++) {
      const y = 200 + i * 10;
      p.line(0, y, 500, y);
    }
    p.pop();
    // end of stripes

    p.pop();
    // end left half

    // right half of circle
    p.push();
    p.beginClip();
    p.rect(250, 0, 250, 700);
    p.endClip();

    // smaller circle inside right half
    p.push();
    p.beginClip();
    p.circle(375, 400, 200);
    p.endClip();

    // draw polka dots in cyan
    p.push();
    p.fill(0, 255, 255);
    for (let i = 0; i < 10; i++) {
      const x = 250 + 50 * i;
      for (let j = 0; j < 10; j++) {
        const y = 345 + 50 * j;
        p.circle(x, y, 45);
      }
    }
    p.pop();
    // end polka dots

    p.pop();
    // end smaller circle

    // outside of smaller circle
    // smaller circle inside right half
    p.push();
    p.beginClip({ invert: true });
    p.circle(375, 400, 200);
    p.endClip();

    // draw sine waves in green
    p.push();
    p.stroke(0, 255, 0);
    p.noFill();
    for (let i = 0; i < 10; i++) {
      const x_center = 250 + i * 10;
      for (let j = 0; j < 300; j++) {
        const offset = 5 * Math.sin(2 * Math.PI * 1 * (j / 100));
        const y = 200 + j;
        p.point(x_center + offset, y);
      }
    }
    p.pop();
    // end of sine wave

    // draw thick boundary of smaller circle
    p.push();
    p.strokeWeight(5);
    p.noFill();
    p.stroke(255, 255, 0);
    p.circle(375, 400, 200);
    p.pop();
    // end of smaller circle

    p.pop();
    // end right half

    // Draw a dividing line and circle as decoration
    p.push();
    p.stroke(255, 0, 255);
    p.strokeWeight(10);
    p.noFill();
    p.line(250, 250, 250, 250 + 200);
    p.circle(250, 350, 200); // did I miss a pop somewhere?
    p.pop();

    p.pop();
    // end big circle
  };

  p.draw = () => {
    p.background(0);
    TANGLE.draw(p);
  };
};
