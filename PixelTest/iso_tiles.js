import { Index2D } from "../sketchlib/Grid.js";
import { Direction } from "../sketchlib/pga2d/Direction.js";
import { Tilemap } from "../sketchlib/pixel/Tilemap.js";

export const ISO_BASIS_TILES = {
  x: new Direction(-1, 1),
  y: new Direction(1, 1),
  z: new Direction(0, -2),
};

/**
 * What direction does the diagonal of an iso tile slant? This is determined
 * by parity in the 2D grid
 * @enum {number}
 */
export const IsoSlant = {
  RIGHT: 0,
  LEFT: 1,
};

export const NONE = 0;
export const TOP = 1;
export const LEFT = 2;
export const RIGHT = 3;

/**
 * Compute the index for an isometric face tile
 * @param {IsoSlant} slant Which direction the tiles slant. Tiles in the left half of the tileset slant to the left, and vice versa
 * @param {number} upper_face What kind of face is in the upper triangle of the tile
 * @param {number} lower_face What kind of face is in the lower triangle of the tile
 * @returns {number} Tile index within the tileset
 */
export function iso_face_tile(slant, upper_face, lower_face) {
  const row = lower_face;
  const col = 4 * slant + upper_face;
  return 8 * row + col;
}

/**
 * Compute a patch of isometric face tiles all at once. This handles computing the slant
 *
 * This assumes the first tile will slant to the right like in the top left of an isometric cube
 * @param {[number, number][][]} faces Pairs of (upper_face, lower_face) in a grid. Use [NONE, NONE] for transparent tiles
 * @returns {number[][]} A patch of tiles, usable with Tilemap.blit_patch
 */
export function iso_face_patch(faces) {
  return faces.map((row, i) =>
    row.map(([upper_face, lower_face], j) => {
      const slant = (i + j) % 2;
      return iso_face_tile(slant, upper_face, lower_face);
    }),
  );
}

const PATCH_CUBE_FACES = iso_face_patch([
  [
    [NONE, TOP],
    [NONE, TOP],
  ],
  [
    [TOP, LEFT],
    [TOP, RIGHT],
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

export const EDGE_OFFSET = 32;
export const EDGE_HIGHLIGHT_OFFSET = 40;

/**
 * Compute the index of an edge tile from the tileset
 * @param {IsoSlant} slant The tiles that slant to the left are on the left half of the tileset, and likewise for the right-slanted tiles
 * @param {number} flags If the tile should show a diagonal edge
 * @param {number} [offset=EDGE_OFFSET] Index of the first tile for a set of edges (e.g. regular edges vs highlight)
 * @returns {number} index of the tile
 */
export function iso_edge_tile(slant, flags, offset = EDGE_OFFSET) {
  return offset + slant * 4 + flags;
}

export const DIAGONAL = 0b10;
export const VERTICAL = 0b01;

/**
 * Compute edge tile indices for a whole patch at once. This handles computing
 * the alternating slant direction. Note that the first tile is assumed to
 * slant to the right (like it does for the top face of an isometric cube)
 * @param {number[][]} flags Bit flags, DIAGONAL, VERTICAL or both
 * @param {number} [offset=EDGE_OFFSET] Tile index of the first tile, as there are multiple edge styles
 * @returns {number[][]} A patch suitable for use with Tilemap.blit_patch
 */
export function iso_edge_patch(flags, offset = EDGE_OFFSET) {
  return flags.map((row, i) =>
    row.map((flags, j) => {
      const slant = (i + j) % 2;
      return iso_edge_tile(slant, flags, offset);
    }),
  );
}

export const PATCH_CUBE_EDGES = iso_edge_patch([
  [DIAGONAL, DIAGONAL, 0],
  [VERTICAL | DIAGONAL, DIAGONAL, VERTICAL],
  [VERTICAL, VERTICAL, VERTICAL],
  [DIAGONAL, VERTICAL | DIAGONAL, 0],
]);

/**
 * Blit several tiles that correspond to one cube in isometric projection
 * @param {Tilemap} tilemap An isometric tileset
 * @param {Index2D} coords The coordinates for the top left corner of the cube's bounding box
 */
export function blit_cube(tilemap, coords) {
  tilemap.blit_patch(coords, PATCH_CUBE_FACES);
  tilemap.blit_patch(coords, PATCH_CUBE_EDGES);
}
