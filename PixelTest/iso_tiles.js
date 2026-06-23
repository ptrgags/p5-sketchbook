import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";

export const ISO_BASIS_TILES = {
  x: new Direction(-1, 1),
  y: new Direction(1, 1),
  z: new Direction(0, -2),
};

const PATCH_CUBE_FACES = [
  [12, 8],
  [17, 29],
  [18, 27],
  [2, 7],
];

export const EDGE_OFFSET = 32;
export const PATCH_CUBE_EDGES = [
  [EDGE_OFFSET + 6, EDGE_OFFSET + 2, EDGE_OFFSET + 0],
  [EDGE_OFFSET + 3, EDGE_OFFSET + 6, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 1, EDGE_OFFSET + 1, EDGE_OFFSET + 1],
  [EDGE_OFFSET + 2, EDGE_OFFSET + 7, EDGE_OFFSET + 0],
];

/**
 *
 * @param {Tilemap} tilemap
 * @param {Index2D} coords
 */
export function blit_cube(tilemap, coords) {
  tilemap.blit_patch(coords, PATCH_CUBE_FACES);
  tilemap.blit_patch(coords, PATCH_CUBE_EDGES);
}
