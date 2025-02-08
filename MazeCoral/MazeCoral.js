import { GridDirection } from "../sketchlib/GridDiection.js";
import {
  RectPrimitive,
  GroupPrimitive,
  LinePrimitive,
} from "../sketchlib/primitives.js";
import { Point } from "../pga2d/objects.js";
import { Color, Style } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { generate_maze } from "./RandomDFSMaze.js";
import { CoralTile } from "../sketchlib/coral/CoralTile.js";
import { Rect } from "../sketchlib/coral/Rect.js";

const WIDTH = 500;
const HEIGHT = 700;
const GRID_ROWS = 14;
const GRID_COLS = 10;
const CELL_WIDTH = WIDTH / GRID_COLS;
const CELL_HEIGHT = HEIGHT / GRID_ROWS;

const GRID = generate_maze(GRID_ROWS, GRID_COLS);

function render_grid_outline(grid) {
  const grid_primitives = grid.map_array((index) => {
    const { i, j } = index;

    const position = Point.point(j * CELL_WIDTH, i * CELL_HEIGHT);
    const dimensions = Point.point(CELL_WIDTH, CELL_HEIGHT);
    return new RectPrimitive(position, dimensions);
  });

  const GRID_STYLE = new Style().with_stroke(new Color(127, 127, 127));
  return new GroupPrimitive(grid_primitives, GRID_STYLE);
}

const GRID_OUTLINE = render_grid_outline(GRID);

function render_connections(grid) {
  const connection_primitives = grid
    .map_array((index, cell) => {
      const { i, j } = index;

      const center = Point.point(
        (j + 0.5) * CELL_WIDTH,
        (i + 0.5) * CELL_HEIGHT
      );

      const lines = [];

      // Since everything is doubly-linked, we only need to look at one
      // half of the connections
      if (cell.is_connected(GridDirection.UP)) {
        const neighbor_center = center.add(Point.DIR_Y.scale(-CELL_HEIGHT));
        const line = new LinePrimitive(center, neighbor_center);
        lines.push(line);
      }

      if (cell.is_connected(GridDirection.LEFT)) {
        const neighbor_center = center.add(Point.DIR_X.scale(-CELL_WIDTH));
        const line = new LinePrimitive(center, neighbor_center);
        lines.push(line);
      }

      return lines;
    })
    .flat();

  const CONNECTION_STYLE = new Style()
    .with_stroke(new Color(255, 127, 0))
    .with_width(2);
  return new GroupPrimitive(connection_primitives, CONNECTION_STYLE);
}
const CONNECTIONS = render_connections(GRID);

const CORAL_TILES = GRID.map((index, cell) => {
  const { i, j } = index;
  const quad = new Rect(
    j * CELL_WIDTH,
    i * CELL_HEIGHT,
    CELL_WIDTH,
    CELL_HEIGHT
  );
  return new CoralTile(quad, cell.connection_flags);
});

export const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
  };

  p.draw = () => {
    p.background(0);
    draw_primitive(p, GRID_OUTLINE);
    draw_primitive(p, CONNECTIONS);
  };
};
