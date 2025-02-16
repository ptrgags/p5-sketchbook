/**
 * Check if a point is within the bounds of e.g. the canvas.
 * @param {number} x The x coordinate of the test point
 * @param {number} y The y coordinate of the test point
 * @param {number} width The width of the canvas
 * @param {number} height The height of the canvas
 * @returns true if (x, y) is within [0, width] x [0, height]
 */
export function in_bounds(x, y, width, height) {
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return false;
  }

  return true;
}
