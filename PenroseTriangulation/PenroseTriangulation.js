import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { Style } from "../sketchlib/Style.js";
import { TriangleGrid } from "./triangle_grid.js";

const A = new Index2D(0, 0);
const B = new Index2D(0, 1);
const C = new Index2D(0, 2);
const D = new Index2D(1, 0);
const E = new Index2D(1, 1);
const F = new Index2D(1, 2);
const G = new Index2D(2, 0);
const H = new Index2D(2, 1);
const I = new Index2D(2, 2);

/**
 * @type {[Index2D, Index2D][]}
 */
const CONNECTIONS = [
  // Outer square
  [A, B],
  [B, C],
  [C, F],
  [F, I],
  [I, H],
  [H, G],
  [G, D],
  [D, A],
  // Diagonals
  [D, B],
  [G, E],
  [E, C],
  [H, F],
];

const GRID = new TriangleGrid(3, 3, CONNECTIONS);

const SIZE = 32;
const BASIS = {
  x: new Direction(-2 * SIZE, SIZE),
  y: new Direction(2 * SIZE, SIZE),
  z: new Direction(0, -2 * SIZE),
  neg_x: new Direction(2 * SIZE, SIZE),
  neg_y: new Direction(-2 * SIZE, SIZE),
  neg_z: new Direction(0, 2 * SIZE),
};
const ORIGIN = new Point(0, 0);

/**
 * Get a position on the screen from the iso grid settings
 * @param {Index2D} cell
 * @returns {Point}
 */
function iso_position(cell) {
  const { i, j } = cell;

  return ORIGIN.add(BASIS.neg_z.scale(i)).add(BASIS.y.scale(j));
}

const VERTICES = GRID.vertex_iter()
  .map((cell) => iso_position(cell.index))
  .toArray();
const STYLE_VERTEX = new Style({
  fill: Color.WHITE,
});

const EDGES = GRID.edge_iter()
  .map(([a, b]) => {
    const pos_a = iso_position(a.index);
    const pos_b = iso_position(b.index);
    return new LineSegment(pos_a, pos_b);
  })
  .toArray();
const STYLE_EDGES = new Style({
  stroke: Color.WHITE,
});

const SCENE = group(style(EDGES, STYLE_EDGES), style(VERTICES, STYLE_VERTEX));

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
    SCENE.draw(p);
  };
};
