import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { IsoGrid } from "./IsoGrid.js";

// See https://en.wikipedia.org/wiki/Ordered_dithering#Threshold_map
const BAYER8 = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

const BAYER_ISO = new IsoGrid(
  new RectPrimitive(new Point(25, 50), new Direction(200, 200)),
  8,
  8,
  (row, col) => {
    return BAYER8[row][col] / 63;
  }
);

const THRESHOLD = 10;
const DITHERED_ISO = new IsoGrid(
  new RectPrimitive(new Point(275, 50), new Direction(200, 200)),
  8,
  8,
  (row, col) => {
    const bayer = BAYER8[row][col];
    // bandpass the bayer matrix
    return Number(bayer < THRESHOLD);
  }
);

const BAYER_PRIM = BAYER_ISO.render();
const DITHER_PRIM = DITHERED_ISO.render();

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

    BAYER_PRIM.draw(p);
    DITHER_PRIM.draw(p);
  };
};
