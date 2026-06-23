import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import { blit_cube, EDGE_OFFSET, ISO_BASIS_TILES } from "./iso_tiles.js";

const PATCH_EDGE_X_FACES = [
  [12, 8],
  [1, 29],
  [0, 27],
  [0, 7],
];
const PATCH_EDGE_X_EDGES = [
  [EDGE_OFFSET + 6, EDGE_OFFSET + 2, EDGE_OFFSET + 0],
  [EDGE_OFFSET + 2, EDGE_OFFSET + 6, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 0, EDGE_OFFSET + 1, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 0, EDGE_OFFSET + 7, EDGE_OFFSET + 0],
];

const PATCH_EDGE_Y_FACES = [
  [12, 8],
  [17, 5],
  [18, 0],
  [2, 0],
];
const PATCH_EDGE_Y_EDGES = [
  [EDGE_OFFSET + 6, EDGE_OFFSET + 2],
  [EDGE_OFFSET + 3, EDGE_OFFSET + 6],
  [EDGE_OFFSET + 1, EDGE_OFFSET + 0],
  [EDGE_OFFSET + 2, EDGE_OFFSET + 0],
];

const PATCH_EDGE_Z_FACES = [
  [16, 28],
  [18, 27],
  [2, 7],
];
const PATCH_EDGE_Z_EDGES = [
  [EDGE_OFFSET + 3, EDGE_OFFSET + 6, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 1, EDGE_OFFSET + 1, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 2, EDGE_OFFSET + 7, EDGE_OFFSET + 0],
];

/**
 * @param {Tilemap} tilemap The tilemap to blit into
 * @param {Index2D} center_coords coordinates for the top left of the center cube
 * @param {boolean[]} connection_flags flags for (-x, -y, -z, +x, +y, +z) connections
 */
export function penrose_vertex(tilemap, center_coords, connection_flags) {
  const [neg_x, neg_y, neg_z, pos_x, pos_y, pos_z] = connection_flags;

  // convert to a direction to do math
  const center_dir = new Direction(center_coords.j, center_coords.i);

  // -x, -y, -z are farthest away from viewer so render them first
  if (neg_x) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.x.neg());
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (neg_y) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.y.neg());
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (neg_z) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.z.neg());
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  // center cube is always present
  blit_cube(tilemap, center_coords);

  // +x, +y, +z are closest to the viewer
  if (pos_x) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.x);
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (pos_y) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.y);
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }

  if (pos_z) {
    const { x, y } = center_dir.add(ISO_BASIS_TILES.z);
    const coords = new Index2D(y, x);
    blit_cube(tilemap, coords);
  }
}

/**
 *
 * @param {Tilemap} tilemap
 * @param {Index2D} coords
 * @param {"x" | "y" | "z"} edge_type
 */
export function penrose_edge(tilemap, coords, edge_type) {
  if (edge_type === "x") {
    tilemap.blit_patch(coords, PATCH_EDGE_X_FACES);
    tilemap.blit_patch(coords, PATCH_EDGE_X_EDGES);
  } else if (edge_type === "y") {
    tilemap.blit_patch(coords, PATCH_EDGE_Y_FACES);
    tilemap.blit_patch(coords, PATCH_EDGE_Y_EDGES);
  } else {
    tilemap.blit_patch(coords, PATCH_EDGE_Z_FACES);
    tilemap.blit_patch(coords, PATCH_EDGE_Z_EDGES);
  }
}
