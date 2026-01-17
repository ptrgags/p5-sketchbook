import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { LinePrimitive } from "../sketchlib/primitives/LinePrimitive.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
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

const THRESHOLD = 45;
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

const basis = BAYER_ISO.basis;
const left = basis.position(8, 0, THRESHOLD / 63);
const bottom = basis.position(8, 8, THRESHOLD / 63);
const right = basis.position(0, 8, THRESHOLD / 63);
const top = basis.position(0, 0, THRESHOLD / 63);

const STYLE_THRESHOLD = new Style({
  stroke: Color.RED,
});

const front_layer = style(
  [new LinePrimitive(left, bottom), new LinePrimitive(bottom, right)],
  STYLE_THRESHOLD
);

const back_layer = style(
  [new LinePrimitive(right, top), new LinePrimitive(top, left)],
  STYLE_THRESHOLD
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

  p.draw = () => {
    p.background(0);

    back_layer.draw(p);
    BAYER_PRIM.draw(p);
    DITHER_PRIM.draw(p);
    front_layer.draw(p);
  };
};
