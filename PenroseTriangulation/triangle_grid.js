import { FlagSet } from "../sketchlib/FlagSet.js";
import { Grid, Index2D } from "../sketchlib/Grid.js";

/**
 * @enum {number}
 */
export const IsoDirection = {
  NEG_X: 0,
  NEG_Y: 1,
  NEG_Z: 2,
  POS_X: 3,
  POS_Y: 4,
  POS_Z: 5,
  COUNT: 6,
};

/**
 *
 * @param {IsoDirection} direction
 * @returns {IsoDirection}
 */
function opposite(direction) {
  switch (direction) {
    case IsoDirection.NEG_X:
      return IsoDirection.POS_X;
    case IsoDirection.NEG_Y:
      return IsoDirection.POS_Y;
    case IsoDirection.NEG_Z:
      return IsoDirection.POS_Z;
    case IsoDirection.POS_X:
      return IsoDirection.NEG_X;
    case IsoDirection.POS_Y:
      return IsoDirection.NEG_Y;
    case IsoDirection.POS_Z:
      return IsoDirection.NEG_Z;
    default:
      throw new Error("invalid direction");
  }
}

/**
 * Get the direction from a to b as an IsoDirection
 * @param {Index2D} a
 * @param {Index2D} b
 * @returns {IsoDirection | undefined}
 */
function get_neighbor_dir(a, b) {
  const { i: ai, j: aj } = a;
  const { i: bi, j: bj } = b;
  const di = bi - ai;
  const dj = bj - aj;

  if (di === 1 && dj === -1) {
    return IsoDirection.POS_X;
  }

  if (di === -1 && dj === 1) {
    return IsoDirection.NEG_X;
  }

  if (di === 0 && dj === 1) {
    return IsoDirection.POS_Y;
  }

  if (di === 0 && dj === -1) {
    return IsoDirection.NEG_Y;
  }

  if (di === -1 && dj === 0) {
    return IsoDirection.POS_Z;
  }

  if (di === 1 && dj === 0) {
    return IsoDirection.NEG_Z;
  }

  return undefined;
}

export class TriangleGridCell {
  /**
   * Constructor
   * @param {Index2D} index
   */
  constructor(index) {
    this.index = index;
    this.connection_flags = new FlagSet(0, IsoDirection.COUNT);
  }

  /**
   *
   * @param {IsoDirection} direction
   * @returns
   */
  is_connected(direction) {
    return this.connection_flags.has_flag(direction);
  }

  get is_disconnected() {
    return this.connection_flags.is_empty;
  }

  /**
   * Connect two adjacent cells
   * @param {TriangleGridCell} cell_a
   * @param {TriangleGridCell} cell_b
   */
  static connect(cell_a, cell_b) {
    const dir = get_neighbor_dir(cell_a.index, cell_b.index);
    if (dir === undefined) {
      throw new Error("cells must be adjacent");
    }
    cell_a.connection_flags.set_flag(dir);
    cell_b.connection_flags.set_flag(opposite(dir));
  }
}

export class TriangleGrid {
  /**
   * Constructor
   * @param {number} rows Number of vertices in the -z direction
   * @param {number} cols Number of the
   * @param {[Index2D, Index2D][]} connections
   */
  constructor(rows, cols, connections) {
    this.grid = new Grid(rows, cols);
    this.grid.fill((index) => {
      return new TriangleGridCell(index);
    });

    for (const [a, b] of connections) {
      const cell_a = this.grid.get(a);
      const cell_b = this.grid.get(b);
      TriangleGridCell.connect(cell_a, cell_b);
    }
  }

  /**
   * Iterate over vertices with at least one connection
   * @returns {Generator<TriangleGridCell>}
   */
  *vertex_iter() {
    for (const cell of this.grid) {
      if (!cell.is_disconnected) {
        yield cell;
      }
    }
  }

  /**
   * @returns {Generator<[TriangleGridCell, TriangleGridCell, "x" | "y" | "z"]>}
   */
  *edge_iter() {
    for (const cell of this.grid) {
      const { i, j } = cell.index;

      // Only iterate over half of the directions so we don't double count
      // edges
      if (cell.is_connected(IsoDirection.NEG_Z)) {
        const neighbor_idx = new Index2D(i + 1, j);
        yield [cell, this.grid.get(neighbor_idx), "z"];
      }

      if (cell.is_connected(IsoDirection.POS_Y)) {
        const neighbor_idx = new Index2D(i, j + 1);
        yield [cell, this.grid.get(neighbor_idx), "y"];
      }

      if (cell.is_connected(IsoDirection.NEG_X)) {
        const neighbor_idx = new Index2D(i - 1, j + 1);
        yield [cell, this.grid.get(neighbor_idx), "x"];
      }
    }
  }
}
