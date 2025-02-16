import { Index2D } from "../sketchlib/Grid.js";

/**
 * A Pentag tile has 5 sides. Even if the tile is flipped, they are referred
 * to as follows:
 *    ___top___
 *   |         \
 *   |        top diag
 *   |           \
 *  vertical      >
 *   |           /
 *   |        bottom diag
 *   |__bottom_/
 */
export const PentagSide = {
  VERTICAL: 0,
  TOP: 1,
  TOP_DIAG: 2,
  BOTTOM_DIAG: 3,
  BOTTOM: 4,
  COUNT: 5,
};
Object.freeze(PentagSide);

/**
 * Get the opposite side of a tile edge. This is the edge of the neighbor
 * tile in that direction.
 * @param {PentagSide} side The side to get the opposite of
 * @returns The opposite side
 */
export function opposite_side(side) {
  switch (side) {
    case PentagSide.VERTICAL:
      return PentagSide.VERTICAL;
    case PentagSide.TOP:
      return PentagSide.BOTTOM;
    case PentagSide.TOP_DIAG:
      return PentagSide.BOTTOM_DIAG;
    case PentagSide.BOTTOM:
      return PentagSide.TOP;
    case PentagSide.BOTTOM_DIAG:
      return PentagSide.TOP_DIAG;
  }
}

/**
 * The pentag grid tiles have 4 possible orientations.
 * facing forwards/backwards, and whether the column is staggered by half
 * a row
 *
 * --->           <----
 *      <--- --->
 */
export const PentagColumnType = {
  FORWARD: 0,
  FLIPPED_STAGGERED: 1,
  FORWARD_STAGGERED: 2,
  FLIPPED: 3,
  COUNT: 4,
};
Object.freeze(PentagColumnType);

/**
 * An index for use for the PentagGrid. Since the grid is made up of
 * pentagons, the math for computing neighbors is a bit different from Index2D
 */
export class PentagIndex {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  to_index_2d() {
    return new Index2D(this.row, this.col);
  }

  get column_type() {
    // These correspond to the 4 enum values of PentagColumnType
    return this.col % PentagColumnType.COUNT;
  }

  get is_flipped() {
    const col_type = this.column_type;
    return (
      col_type === PentagColumnType.FLIPPED ||
      col_type === PentagColumnType.FLIPPED_STAGGERED
    );
  }

  get is_staggered() {
    const col_type = this.column_type;
    return (
      col_type === PentagColumnType.FORWARD_STAGGERED ||
      col_type === PentagColumnType.FLIPPED_STAGGERED
    );
  }

  get_neighbor(side) {
    const { row, col } = this;
    const col_direction = this.is_flipped ? -1 : 1;
    const col_type = this.column_type;

    if (side === PentagSide.VERTICAL) {
      return new PentagIndex(row, col - col_direction);
    }

    if (side === PentagSide.TOP) {
      return new PentagIndex(row - 1, col);
    }

    if (side === PentagSide.TOP_DIAG) {
      switch (col_type) {
        case PentagColumnType.FORWARD:
          return new PentagIndex(row - 1, col + 1);
        case PentagColumnType.FLIPPED_STAGGERED:
          return new PentagIndex(row, col - 1);
        case PentagColumnType.FORWARD_STAGGERED:
          return new PentagIndex(row, col + 1);
        case PentagColumnType.FLIPPED:
          return new PentagIndex(row - 1, col - 1);
      }
    }

    if (side === PentagSide.BOTTOM_DIAG) {
      switch (col_type) {
        case PentagColumnType.FORWARD:
          return new PentagIndex(row, col + 1);
        case PentagColumnType.FLIPPED_STAGGERED:
          return new PentagIndex(row + 1, col - 1);
        case PentagColumnType.FORWARD_STAGGERED:
          return new PentagIndex(row + 1, col + 1);
        case PentagColumnType.FLIPPED:
          return new PentagIndex(row, col - 1);
      }
    }

    // PentagSide.SIDE_BOTTOM
    return new PentagIndex(row + 1, col);
  }

  static from_index_2d(index) {
    const { i, j } = index;
    return new PentagIndex(i, j);
  }
}
