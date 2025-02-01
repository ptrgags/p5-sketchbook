/**
 * Iterate over a 2D range of values, performing an action at each step.
 * This is useful for drawing graphics arranged in a grid even if there's no
 * data that needs to be stored.
 *
 * The range is iterated over in row-major order.
 * @param {number} rows How many rows to iterate over
 * @param {number} cols How many columns to iterate over
 * @param {function(number, number)} callback The action to perform at cell (i, j)
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
 * The naming convention assumes row-major order as this is common for 2D
 * arrays.
 */
export class Index2D {
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
    return new Index2D(this.i + 1, this.j + 1);
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

    const i = index.i * this.cols + index.j;
    if (i >= this.values.length) {
      throw new Error("index out of bounds");
    }
    this.values[i] = value;
  }

  get(index) {
    if (!(index instanceof Index2D)) {
      throw new Error("index must be an Index2D object");
    }

    const i = index.i * this.cols + index.j;
    if (i >= this.values.length) {
      throw new Error("index out of bounds");
    }
    return this.values[i];
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
}
