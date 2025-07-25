import { Rectangle } from "../lab/lablib/Rectangle.js";
import { Point } from "../pga2d/objects.js";
import { Direction } from "./Direction.js";

/**
 * Iterate over a 2D range of values, performing an action at each step.
 * This is useful for drawing graphics arranged in a grid even if there's no
 * data that needs to be stored.
 *
 * The range is iterated over in row-major order.
 * @param {number} rows How many rows to iterate over
 * @param {number} cols How many columns to iterate over
 * @param {function(number, number): void} callback The action to perform at cell (i, j)
 */
export function griderator(rows, cols, callback) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      callback(i, j);
    }
  }
}

/**
 * 2D index (i, j) into a Grid. The indices must be non-negative.
 * The naming convention assumes row-major order as this is sketchlib for 2D
 * arrays.
 */
export class Index2D {
  /**
   * Constructor
   * @param {number} i The first index, usually the row
   * @param {number} j The second index, usually the column
   */
  constructor(i, j) {
    if (i < 0) {
      throw new Error("i must be non-negative");
    }
    if (j < 0) {
      throw new Error("j must be non-negative");
    }

    this.i = i;
    this.j = j;
  }

  /**
   * Get the coordinates of the left neighbor
   * @returns {Index2D | undefined} The left neighbor, or undefined if at the edge of the grid
   */
  left() {
    if (this.j === 0) {
      return undefined;
    }

    return new Index2D(this.i, this.j - 1);
  }

  /**
   * Get the coordinates of the neighbor to the right
   * @returns {Index2D} The neighbor to the right
   */
  right() {
    return new Index2D(this.i, this.j + 1);
  }

  /**
   * Get the coordinates of the neighbor one row above
   * @returns {Index2D | undefined} The upwards neighbor, or undefined if at the edge of the grid
   */
  up() {
    if (this.i === 0) {
      return undefined;
    }

    return new Index2D(this.i - 1, this.j);
  }

  /**
   * Get the coordinates of the neighbor one row below
   * @returns {Index2D} The downwards neighbor
   */
  down() {
    return new Index2D(this.i + 1, this.j);
  }

  /**
   * Compute the direction to a neighboring cell.
   * @param {Index2D} other Another cell
   * @returns {Direction|undefined} If the cell neighbors this one, the grid direction is returned. Else undefined is returned to indicate not adjacent.
   */
  direction_to(other) {
    const { i: ai, j: aj } = this;
    const { i: bi, j: bj } = other;

    const di = bi - ai;
    const dj = bj - aj;

    if (dj === 1 && di === 0) {
      return Direction.RIGHT;
    }

    if (dj === -1 && di === 0) {
      return Direction.LEFT;
    }

    if (dj === 0 && di === 1) {
      return Direction.DOWN;
    }

    if (dj === 0 && di === -1) {
      return Direction.UP;
    }

    return undefined;
  }

  /**
   * Convert an index (assumed to be row-major) to a point in the world
   * @param {Point} offset The offset in units of the world as a Point.point
   * @param {Point} stride A Point.direction for the stride
   * @returns {Point} A point in the world
   */
  to_world(offset, stride) {
    const { i, j } = this;
    const { x, y } = offset;
    const { x: dx, y: dy } = stride;
    return Point.direction(x + j * dx, y + i * dy);
  }
}

/**
 * 2D array of values. It is indexed by Index2D objects rather than
 * an integer index.
 *
 * @template T
 */
export class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    // Preallocate the array
    this.values = new Array(rows * cols);
  }

  *[Symbol.iterator]() {
    yield* this.values;
  }

  entries() {
    return this.values.entries();
  }

  /**
   * Fill the grid by applying a callback function at every grid cell.
   * @param {function(Index2D): T} callback A function that takes an index and
   * computes the value to store at that point in the grid.
   */
  fill(callback) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.values[i * this.cols + j] = callback(new Index2D(i, j));
      }
    }
  }

  /**
   * Call a function at each cell of the grid
   * @param {function(Index2D, T): void} callback A function to call with the given index and cell value
   */
  for_each(callback) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const index = new Index2D(i, j);
        callback(index, this.get(index));
      }
    }
  }

  /**
   * Iterate over the grid, and produce a new grid of the same size by
   * calling a function at each cell
   * @template U
   * @param {function(Index2D, T): U} callback A function that takes an index and the current value and computes a corresponding value in the new grid
   * @returns {Grid<U>} A new grid
   */
  map(callback) {
    const result = new Grid(this.rows, this.cols);
    result.fill((index) => callback(index, this.get(index)));
    return result;
  }

  /**
   * Like map, but return an Array instead of a grid
   * @template U
   * @param {function(Index2D, T): U} callback  A function that takes the index and current value and computes a new value
   * @returns {Array<U>} an array of computed values, flattened in row-major order
   */
  map_array(callback) {
    const result = new Array(this.rows * this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const index = new Index2D(i, j);
        result[i * this.cols + j] = callback(index, this.get(index));
      }
    }
    return result;
  }

  /**
   * Get the number of entries in the underlying array. This is equal to
   * this.rows * this.cols
   * @return {Number} The number of entries in the grid
   */
  get length() {
    return this.values.length;
  }

  set(index, value) {
    if (!(index instanceof Index2D)) {
      throw new Error("index must be an Index2D object");
    }

    const i = this.hash(index);
    if (i >= this.values.length) {
      throw new Error("index out of bounds");
    }
    this.values[i] = value;
  }

  get(index) {
    if (!(index instanceof Index2D)) {
      throw new Error("index must be an Index2D object");
    }

    const i = this.hash(index);
    if (i >= this.values.length) {
      throw new Error("index out of bounds");
    }
    return this.values[i];
  }

  hash(index) {
    const { i, j } = index;
    return i * this.cols + j;
  }

  /**
   * Get the right neighbor of an index, performing bounds checking
   * @param {Index2D} index The index to check
   * @returns {Index2D | undefined} The right neighbor, or undefined if at the
   * edge of the grid
   */
  right(index) {
    if (index.j >= this.cols - 1) {
      return undefined;
    }

    return index.right();
  }

  /**
   * Get the neighbor one row below, performing bounds checking.
   * @param {Index2D} index the index to check
   * @returns {Index2D | undefined} The downwards neighbor, or undefined if at
   * the edge of the grid
   */
  down(index) {
    if (index.i >= this.rows - 1) {
      return undefined;
    }

    return index.down();
  }

  /**
   * Get a neighbor from the grid.
   * @param {Index2D} index the index to check
   * @param {Direction} direction The direction to the adjacent cell
   * @returns {Index2D | undefined} The neighbor, or undefined if at the edge
   * of the grid.
   */
  get_neighbor(index, direction) {
    switch (direction) {
      case Direction.RIGHT:
        return this.right(index);
      case Direction.UP:
        return index.up();
      case Direction.LEFT:
        return index.left();
      case Direction.DOWN:
        return this.down(index);
    }
  }

  /**
   * Check if an index is in the bounds of the grid
   * @param {Index2D} index The index to check
   * @returns {boolean} true if the index is in bounds
   */
  in_bounds(index) {
    const { i, j } = index;

    return i >= 0 && i < this.rows && j >= 0 && j < this.cols;
  }

  /**
   * Get neighbor indices that are in bounds. Results are returned in
   * counterclockwise order starting from the right.
   * @param {Index2D} index The current cell index
   * @returns {Index2D[]} List of all in-bounds neighbors accessible from this cell.
   */
  get_neighbors(index) {
    return [
      this.right(index),
      index.up(),
      index.left(),
      this.down(index),
    ].filter((x) => x !== undefined && this.in_bounds(x));
  }

  /**
   * Evenly space items of item_size within the bounding rectangle according
   * to the number of rows/columns in this grid.
   * @param {Rectangle} boundary The bounding rectangle
   * @param {Point} item_size The size of each item as a Point.direction
   * @param {Point} margin How much space to leave around the x or y direction (note that this will be doubled). Any remaining space will be used as padding
   * @return {[Point, Point]} [offset, stride] The computed offset and stride
   */
  compute_layout(boundary, item_size, margin) {
    // If we arranged the items as tightly as possible, how big would this
    // rectangle be?
    const total_item_space = Point.direction(
      item_size.x * this.cols,
      item_size.y * this.rows
    );
    const remaining_space = boundary.dimensions.sub(total_item_space);
    const padding = remaining_space.sub(margin.scale(2));

    const padding_size = Point.direction(
      padding.x / (this.cols - 1),
      padding.y / (this.rows - 1)
    );

    const offset = boundary.position.add(margin);
    const stride = item_size.add(padding_size);
    return [offset, stride];
  }
}
