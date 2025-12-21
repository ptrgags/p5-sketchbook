import { WIDTH, HEIGHT } from "../../sketchlib/dimensions.js";

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    );
  };

  p.draw = () => {
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
  };
};
