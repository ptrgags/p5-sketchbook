import { FlagSet } from "../sketchlib/FlagSet.js";
import { GridDirection } from "../sketchlib/GridDiection.js";
import { Grid, griderator } from "../sketchlib/Grid.js";
import { RectPrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Point } from "../pga2d/objects.js";
import { Color, Style } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";

const WIDTH = 500;
const HEIGHT = 700;
const GRID_ROWS = 14;
const GRID_COLS = 10;

class MazeCell {
  constructor() {
    this.flags = new FlagSet(0, GridDirection.COUNT);
  }
}

const GRID = new Grid(GRID_ROWS, GRID_COLS);
GRID.fill(() => {
  new MazeCell();
});

function make_grid_outline(grid) {
  const cell_width = WIDTH / grid.cols;
  const cell_height = HEIGHT / grid.rows;

  return grid.map_array((index) => {
    const { i, j } = index;

    const position = Point.point(j * cell_width, i * cell_height);
    const dimensions = Point.point(cell_width, cell_height);
    return new RectPrimitive(position, dimensions);
  });
}
const GRID_STYLE = new Style().with_stroke(new Color(200, 200, 200));
const GRID_OUTLINE = new GroupPrimitive(make_grid_outline(GRID), GRID_STYLE);

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
  };

  p.draw = () => {
    p.background(0);
    draw_primitive(p, GRID_OUTLINE);
  };
};
