import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { HarmonicFinder } from "./HarmonicFinder.js";
import { InfiniteHarmonics } from "./InfiniteHarmonics.js";

const SCENE = new ShowHidePrimitive(
  [new HarmonicFinder(), new InfiniteHarmonics()],
  [true, false],
);

// @ts-ignore
export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );
    expect_element("toggle-visualization", HTMLButtonElement).addEventListener(
      "click",
      () => {
        SCENE.show_flags.map((x) => !x);

        // Redraw the scene.
        background(0);
        SCENE.draw(p);
      },
    );

    p.noLoop();

    p.background(0);
    SCENE.draw(p);
  };
};
