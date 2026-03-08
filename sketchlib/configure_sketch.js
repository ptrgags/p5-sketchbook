import { HEIGHT, WIDTH } from "./dimensions.js";

/**
 * Common config settings for all my sketches, call this at the start of
 * setup()
 * @param {import('p5')} p
 */
export function configure_sketch(p) {
  // p5 scales up the canvas on screens with higher pixel density,
  // which means there's way more pixels that need to be rendered every frame.
  // for better performance, set this to 1. I'm using som CSS to rescale the canvas anyway.
  p.pixelDensity(1);

  p.createCanvas(
    WIDTH,
    HEIGHT,
    undefined,
    document.getElementById("sketch-canvas"),
  );
}
