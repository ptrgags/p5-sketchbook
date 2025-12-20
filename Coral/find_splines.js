import { CardinalDirection } from "../sketchlib/CardinalDirection.js";
import { Grid, griderator, Index2D } from "../sketchlib/Grid.js";
import { CoralTile, Quadrant } from "./CoralTile.js";
import { Spline } from "./Spline.js";

/**
 * Get the quadrant
 * @param {Index2D} quadrant_index Index into the larger 2Nx2N grid of quadrants
 * @returns {Quadrant} The quadrant of the current tile
 */
function get_quadrant(quadrant_index) {
  const { i, j } = quadrant_index;

  // north/south alternates with the rows; west/east alternates with the cols
  const is_north = i % 2 === 0;
  const is_west = j % 2 === 0;

  if (is_north && is_west) {
    return Quadrant.NORTHWEST;
  } else if (is_north) {
    return Quadrant.NORTHEAST;
  } else if (is_west) {
    return Quadrant.SOUTHWEST;
  }

  return Quadrant.SOUTHEAST;
}

function get_tile_index(quadrant_index) {
  const { i, j } = quadrant_index;
  return new Index2D(i >> 1, j >> 1);
}

// To save an ugly switch statement, here's a table
// of quadrant -> [
//      direction to check for a connection,
//      name of direction func to call if connected,
//      name of direction func to call if disconnected
// ]
const NEXT_INDEX_LUT = {
  [Quadrant.SOUTHEAST]: [CardinalDirection.RIGHT, "right", "up"],
  [Quadrant.NORTHEAST]: [CardinalDirection.UP, "up", "left"],
  [Quadrant.NORTHWEST]: [CardinalDirection.LEFT, "left", "down"],
  [Quadrant.SOUTHWEST]: [CardinalDirection.DOWN, "down", "right"],
};

function get_next_index(tile, quadrant_index, quadrant) {
  const [check_direction, dir_if_connected, dir_if_disconnected] =
    NEXT_INDEX_LUT[quadrant];

  if (tile.is_connected(check_direction)) {
    return quadrant_index[dir_if_connected]();
  }

  return quadrant_index[dir_if_disconnected]();
}

/**
 * Starting at start_index, circulate around the grid
 * @param {Grid<CoralTile>} tile_grid The NxN grid of coral tiles.
 * @param {Grid<boolean>} visited A 2Nx2N grid of tile quadrants (2x2 per tile) to determine if we've visited the quadrant yet
 * @param {Index2D} start_index The index of the first cell to examine
 * @return {Spline} A spline formed from all the control points we found in DFS preorder
 */
function find_spline(tile_grid, visited, start_index) {
  const control_points = [];

  let current_quadrant_index = start_index;
  while (!visited.get(current_quadrant_index)) {
    visited.set(current_quadrant_index, true);
    const quadrant = get_quadrant(current_quadrant_index);
    const tile_index = get_tile_index(current_quadrant_index);
    const current_tile = tile_grid.get(tile_index);
    const control_point = current_tile.get_control_point(quadrant);
    control_points.push([current_tile.quad, control_point]);

    current_quadrant_index = get_next_index(
      current_tile,
      current_quadrant_index,
      quadrant
    );
  }

  return new Spline(control_points);
}

export function find_splines(tile_grid) {
  const subtile_rows = 2 * tile_grid.rows;
  const subtile_columns = 2 * tile_grid.cols;

  const visited = new Grid(2 * tile_grid.rows, 2 * tile_grid.cols);
  visited.fill(() => false);

  const splines = [];
  griderator(subtile_rows, subtile_columns, (i, j) => {
    const index = new Index2D(i, j);
    if (!visited.get(index)) {
      const spline = find_spline(tile_grid, visited, index);
      splines.push(spline);
    }
  });

  return splines;
}
