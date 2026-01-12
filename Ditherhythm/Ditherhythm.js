import { Direction } from "../pga2d/Direction.js";
import { Point } from "../pga2d/Point.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { RectPrimitive } from "../sketchlib/primitives/RectPrimitive.js";
import { IsoGrid } from "./IsoGrid.js";

const ISO_GRID = new IsoGrid(
  new RectPrimitive(new Point(50, 50), new Direction(400, 400)),
  8,
  8,
  (row, col) => {
    const index = row * 8 + col;
    return (63 - index) / 63;
  }
);

const AXES = ISO_GRID.render_axes();
const GRID_PRIM = ISO_GRID.render();

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

    GRID_PRIM.draw(p);
  };
};
