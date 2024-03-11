import { PentagCell } from "./PentagCell.js";

export class PentagGrid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = new Array(rows * cols);
    this.clear_grid();
  }

  *[Symbol.iterator]() {
    for (const cell of this.grid) {
      if (cell) {
        yield cell;
      }
    }
  }

  clear_grid() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        // Skip cells off the end of the grid
        if (i === this.rows - 1 && PentagGrid.needs_y_offset(j)) {
          continue;
        }

        this.grid[i * this.cols + j] = new PentagCell(i, j);
      }
    }
  }

  get_cell(row, col) {
    return this.grid[row * this.cols + col];
  }

  select(row, col) {
    const cell = this.get_cell(row, col);
    if (!cell.is_selectable) {
      return;
    }

    // Select 2 arcs from this pentag with one side left
    // empty. This is chosen randomly from the valid choices.
    cell.select_random();

    // The pentag will have 2 arcs, with one side without
    // an arc. The adjacent tile to the empty side (if it exists)
    // must have the additive inverse arc type
    // (e.g. 0 <-> 0, 1 <-> 4, 2 <-> 3)
    const arc_type = cell.arc_type;
    const partner_type = (5 - arc_type) % 5;

    const partner = this.get_partner(cell);

    if (partner) {
      partner.select(partner_type);
    }
  }

  get_partner(cell) {
    const [partner_row, partner_col] = cell.get_partner();
    if (
      partner_row < 0 ||
      partner_row >= this.rows ||
      partner_col < 0 ||
      partner_col >= this.cols
    ) {
      return undefined;
    }

    if (
      partner_row === this.rows - 1 &&
      PentagGrid.needs_y_offset(partner_col)
    ) {
      return undefined;
    }

    return this.get_cell(partner_row, partner_col);
  }

  static needs_y_offset(col) {
    // For every four columns, the second and third ones need to be shifted.
    // In other words, if the columns are numbered 0, 1, 2, 3, we want 1 and 2.
    //
    // If we cycle this left (col - 1) === (col + 3) (mod 4), we have
    // 3, 0, 1, 2, and now we can select out 0 or 1 by simple less than.
    return (col + 3) % 4 < 2;
  }
}
