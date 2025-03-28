import { Point } from "../pga2d/objects.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";
import { PerspectiveQuad } from "./PerspectiveQuad.js";

/**
 * Convert the grid of points to a grid of PerspectiveQuads
 * @param {Grid<Point>} points The points
 */
function make_quads(points) {
  const cell_count = points.rows - 1;
  const result = new Grid(cell_count, cell_count);
  result.fill((index) => {
    const a = points.get(index);
    const right = index.right();
    const b = points.get(right);
    const c = points.get(right.down());
    const d = points.get(index.down());

    return new PerspectiveQuad(a, b, c, d);
  });

  return result;
}

/**
 * Take a perspective quad and subdivide it into a power of 2 grid
 * @param {PerspectiveQuad} quad The original quad
 * @param {number} n The integer number of subdivisions. Each
 * @returns {Grid<PerspectiveQuad>} A 2^n x 2^n grid of quads
 */
export function subdivide_quad(quad, n) {
  if (n === 0) {
    // Trivial case, just return the quad wrapped in a grid
    const grid = new Grid(1, 1);
    grid.set(new Index2D(0, 0), quad);
    return grid;
  }

  // How many of each object across one side of the quad
  const cell_count = 1 << n;
  const line_count = cell_count + 1;
  const diag_count = line_count - 2;

  // To subdivide a quad using diagonals, we need to keep track of several
  // grids at once
  // Lines in the a -> b direction through the various points
  const horizontal = new Array(line_count);
  // Lines in the a -> d direction through the various points
  const vertical = new Array(line_count);
  // Diagonals in the a -> c direction
  const diagonals = new Array(diag_count);
  // Diagonals in the b -> d direction
  const cross_diagonals = new Array(diag_count);
  // Points at the corners of the final grid cells
  const points = new Grid(line_count, line_count);

  // The first subdivision is computed directly from the input quad
  const { a, b, c, d } = quad;
  const last_point = line_count - 1;
  horizontal[last_point] = d.join(c);
  horizontal[0] = a.join(b);

  vertical[0] = a.join(d);
  vertical[last_point] = b.join(c);

  const mid_diag = Math.ceil(diag_count / 2);
  diagonals[mid_diag] = a.join(c);
  cross_diagonals[mid_diag] = b.join(d);

  points.set(new Index2D(0, 0), a);
  points.set(new Index2D(0, last_point), b);
  points.set(new Index2D(last_point, last_point), c);
  points.set(new Index2D(last_point, 0), d);

  // Intersect the diagonals to compute the center
  const center = diagonals[mid_diag].meet(cross_diagonals[mid_diag]);
  const mid_point = Math.floor(line_count / 2);
  points.set(new Index2D(mid_point, mid_point), center);

  // Find the vanishing points and from them, compute the center lines
  const vp_right = horizontal[last_point].meet(horizontal[0]);
  const vp_up = vertical[last_point].meet(vertical[0]);
  horizontal[mid_point] = center.join(vp_right);
  vertical[mid_point] = center.join(vp_up);

  // Find the centers of the sides
  points.set(
    new Index2D(0, mid_point),
    horizontal[0].meet(vertical[mid_point])
  );
  points.set(
    new Index2D(mid_point, last_point),
    horizontal[mid_point].meet(vertical[last_point])
  );
  points.set(
    new Index2D(last_point, mid_point),
    horizontal[last_point].meet(vertical[mid_point])
  );
  points.set(
    new Index2D(mid_point, 0),
    horizontal[mid_point].meet(vertical[0])
  );

  // For 1 subdivision, we can short-circuit here
  if (n === 1) {
    return make_quads(points);
  }

  throw new Error("not implemented");
}
