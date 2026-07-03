import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";

const IMGS = new ImageLibrary({
  iso: "sprites/iso-tiles.png",
});

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
  };
};
