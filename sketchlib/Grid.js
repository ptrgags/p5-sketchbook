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

  left() {
    if (this.j === 0) {
      return undefined;
    }

    return new Index2D(this.i, this.j - 1);
  }

  right() {
    return new Index2D(this.i, this.j + 1);
  }

  up() {
    if (this.i === 0) {
      return undefined;
    }

    return new Index2D(this.i - 1, this.j);
  }

  down() {
    return new Index2D(this.i + 1, this.j + 1);
  }
}

export function griderator(rows, cols, callback) {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      callback(i, j);
    }
  }
}

/**
 * 2D Grid class
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

  fill(callback) {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.values[i * this.cols + j] = callback(new Index2D(i, j));
      }
    }
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

  right(index) {
    if (index.j >= this.cols - 1) {
      return undefined;
    }

    return index.right();
  }

  down(index) {
    if (index.i >= this.rows - 1) {
      return undefined;
    }

    return index.down();
  }
}
