import { FlagSet } from "../sketchlib/FlagSet.js";
import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";
import {
  blit_cube,
  DIAGONAL,
  ISO_BASIS_TILES,
  iso_edge_patch,
  iso_face_patch,
  LEFT,
  NONE,
  RIGHT,
  TOP,
  VERTICAL,
} from "./iso_tiles.js";

const PATCH_EDGE_X_FACES = iso_face_patch([
  [
    [NONE, TOP],
    [NONE, TOP],
  ],
  [
    [TOP, NONE],
    [TOP, RIGHT],
  ],
  [
    [NONE, NONE],
    [RIGHT, RIGHT],
  ],
  [
    [NONE, NONE],
    [RIGHT, NONE],
  ],
]);
const PATCH_EDGE_X_EDGES = iso_edge_patch([
  [DIAGONAL, DIAGONAL, 0],
  [DIAGONAL, DIAGONAL, VERTICAL],
  [0, VERTICAL, VERTICAL],
  [0, VERTICAL | DIAGONAL, 0],
]);

const PATCH_EDGE_Y_FACES = iso_face_patch([
  [
    [NONE, TOP],
    [NONE, TOP],
  ],
  [
    [TOP, LEFT],
    [TOP, NONE],
  ],
  [
    [LEFT, LEFT],
    [NONE, NONE],
  ],
  [
    [LEFT, NONE],
    [NONE, NONE],
  ],
]);
const PATCH_EDGE_Y_EDGES = iso_edge_patch([
  [DIAGONAL, DIAGONAL, 0],
  [VERTICAL | DIAGONAL, DIAGONAL, 0],
  [VERTICAL, VERTICAL, 0],
  [DIAGONAL, VERTICAL, 0],
]);

const PATCH_EDGE_Z_FACES = iso_face_patch([
  [
    [NONE, NONE],
    [NONE, NONE],
  ],
  [
    [NONE, LEFT],
    [NONE, RIGHT],
  ],
  [
    [LEFT, LEFT],
    [RIGHT, RIGHT],
  ],
  [
    [LEFT, NONE],
    [RIGHT, NONE],
  ],
]);
const PATCH_EDGE_Z_EDGES = iso_edge_patch([
  [0, 0, 0],
  [VERTICAL | DIAGONAL, DIAGONAL, VERTICAL],
  [VERTICAL, VERTICAL, VERTICAL],
  [DIAGONAL, VERTICAL | DIAGONAL, 0],
]);

/**
 * Flags for the 6 cardinal directions in 3D
 * @enum {number} DirectionFlags
 */
export const DirectionFlags = {
  NEG_X: 1 << 0,
  NEG_Y: 1 << 1,
  NEG_Z: 1 << 2,
  POS_X: 1 << 3,
  POS_Y: 1 << 4,
  POS_Z: 1 << 5,
};
const OFFSET_POS = 3;

const POS_OFFSETS = [ISO_BASIS_TILES.x, ISO_BASIS_TILES.y, ISO_BASIS_TILES.z];
const NEG_OFFSETS = POS_OFFSETS.map((x) => x.neg());

/**
 * A vertex from a triangular tiling corresponds to a cube in the center plus
 * a cube for each outgoing edge
 * @param {Tilemap} tilemap The tilemap to blit into
 * @param {Index2D} center_coords coordinates for the top left of the center cube's bounding box
 * @param {number} connection_flags flags for (-x, -y, -z, +x, +y, +z) connections. Use the DirectionFlags enum for this.
 */
export function penrose_vertex(tilemap, center_coords, connection_flags) {
  const flags = new FlagSet(connection_flags, 6);

  // convert to a direction to do math
  const center_dir = new Direction(center_coords.j, center_coords.i);

  // -x, -y, -z are farthest away from viewer so render them first
  for (const [i, offset] of NEG_OFFSETS.entries()) {
    if (flags.has_flag(i)) {
      const { x, y } = center_dir.add(offset);
      const coords = new Index2D(y, x);
      blit_cube(tilemap, coords);
    }
  }

  // center cube is always present
  blit_cube(tilemap, center_coords);

  // +x, +y, +z are closest to the viewer
  for (const [i, offset] of POS_OFFSETS.entries()) {
    if (flags.has_flag(OFFSET_POS + i)) {
      const { x, y } = center_dir.add(offset);
      const coords = new Index2D(y, x);
      blit_cube(tilemap, coords);
    }
  }
}

/**
 * An edge in a triangular tiling corresponds to two faces of a cube wrapping
 * around the edge
 * @param {Tilemap} tilemap The isometric tileset
 * @param {Index2D} coords Coordinates for the top left of the cube for the edge
 * @param {"x" | "y" | "z"} edge_type The axis along the edge
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
