import { penrose_edge, penrose_vertex } from "../PixelTest/penrose.js";
import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT, SCREEN_DIMENSIONS } from "../sketchlib/dimensions.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { ImageLibrary } from "../sketchlib/pixel/ImageLibrary.js";
import { LineSegment } from "../sketchlib/primitives/LineSegment.js";
import { group, style, xform } from "../sketchlib/primitives/shorthand.js";
import { Transform } from "../sketchlib/primitives/Transform.js";
import { VectorPrimitive } from "../sketchlib/primitives/VectorPrimitive.js";
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
const STYLE_VERTEX = Style.flat(Color.WHITE);

const EDGES = GRID.edge_iter()
  .map(([a, b]) => {
    const pos_a = iso_position(a.index);
    const pos_b = iso_position(b.index);
    return new LineSegment(pos_a, pos_b);
  })
  .toArray();
const STYLE_EDGES = Style.lines(Color.WHITE);

const OFFSET_TRIANGLES = 0.5 * (WIDTH - 4 * SIZE);
const LIL_BIT = 8;

const TRIANGLE_DIAGRAM = xform(
  [style(EDGES, STYLE_EDGES), style(VERTICES, STYLE_VERTEX)],
  new Transform(new Direction(OFFSET_TRIANGLES, LIL_BIT)),
);

const STYLE_ARROW = Style.lines(Color.WHITE, 4);
const ARROW = new VectorPrimitive(
  new Point(0.5 * WIDTH, 6 * SIZE),
  new Point(0.5 * WIDTH, 9 * SIZE),
);

// leave space for the tiling
const TILING = group();
const SCENE = group(TRIANGLE_DIAGRAM, style(ARROW, STYLE_ARROW), TILING);

const IMGS = new ImageLibrary({
  // TODO: Swap in a new tileset for this
  iso: "./sprites/iso-tiles16.png",
});

const ISO_TILE_SIZE = new Direction(32, 16);
function init_sprites(p) {
  const tilemap_size = new Direction(10 + 1, 28);

  // TODO: this could be replaced with the help of Rectangle.align once
  // available
  const margin = SCREEN_DIMENSIONS.sub(
    tilemap_size.mul_components(ISO_TILE_SIZE),
  );
  const offset = new Direction(0.5 * margin.x, margin.y);

  const penrose = IMGS.make_tilemap(
    p,
    "iso",
    ISO_TILE_SIZE,
    // TODO: compute this size
    tilemap_size,
    Point.ORIGIN.add(offset),
  );

  for (const vertex of GRID.vertex_iter()) {
    const { i, j } = vertex.index;
    const tile = new Index2D(4 * (2 * i + j), 4 * j);
    penrose_vertex(penrose, tile, vertex.connection_flags.flags);
  }

  for (const [a, b, axis] of GRID.edge_iter()) {
    const { i: ai, j: aj } = a.index;
    const { i: bi, j: bj } = b.index;
    const i = 0.5 * (ai + bi);
    const j = 0.5 * (aj + bj);
    const tile = new Index2D(4 * (2 * i + j), 4 * j);

    penrose_edge(penrose, tile, axis);
  }

  TILING.regroup(penrose);
}

// @ts-ignore
export const sketch = (p) => {
  p.preload = () => {
    IMGS.preload(p);
  };

  p.setup = () => {
    p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas"),
    );

    init_sprites(p);
  };

  p.draw = () => {
    p.background(0);
    SCENE.draw(p);
  };
};
