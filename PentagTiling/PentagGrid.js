import { PentagCell } from "./PentagCell.js";
import { Grid } from "../sketchlib/Grid.js";
import { in_bounds } from "../common/in_bounds.js";

export class PentagGrid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.grid = new Grid(rows, cols);
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
    this.grid.fill((index) => {
      if (!this.in_bounds(index)) {
        return undefined;
      }

      return new PentagCell(index);
    });
  }

  get_partner(cell) {
    const [partner_row, partner_col] = cell.get_partner();
    return this.get_cell(partner_row, partner_col);
  }

  in_bounds(index) {
    const { i: row, j: col } = index;
    if (!in_bounds(col, row, this.cols, this.rows)) {
      return false;
    }

    if (row === this.rows - 1 && PentagGrid.needs_y_offset(col)) {
      return false;
    }

    return true;
  }

  get_cell(index) {
    if (!this.in_bounds(index)) {
      return undefined;
    }

    return this.grid.get(index);
  }

  select(index) {
    const cell = this.get_cell(index);
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

    const partner = this.get_cell(cell.get_partner());

    if (partner) {
      partner.select(partner_type);
    }

    const one_option_left = [];

    // Update constraints for this tile's neighbors
    for (const [side, neighbor_coords] of cell.all_neighbors.entries()) {
      const neighbor = this.get_cell(neighbor_coords);
      if (!neighbor) {
        continue;
      }

      // To give an example, if the neighbor is in the up direction,
      // then its empty direction must not be in the down direction else
      // the arc in this tile will have nothing to connect to.
      const opposite_side = (5 - side) % 5;
      neighbor.arc_choices[opposite_side] = false;

      if (neighbor.arc_choice_count === 1) {
        one_option_left.push(neighbor);
      }
    }

    // Also update constraints for the partner tile's neighbors
    if (partner) {
      for (const [side, neighbor_coords] of partner.all_neighbors.entries()) {
        const neighbor = this.get_cell(neighbor_coords);
        if (!neighbor) {
          continue;
        }

        // To give an example, if the neighbor is in the up direction,
        // then its empty direction must not be in the down direction else
        // the arc in this tile will have nothing to connect to.
        const opposite_side = (5 - side) % 5;
        neighbor.arc_choices[opposite_side] = false;

        if (neighbor.arc_choice_count === 1) {
          one_option_left.push(neighbor);
        }
      }
    }

    // If we have cells that only have one option left, recursively select
    // them so we don't end up with a tile with no possible choices later.
    for (const cell of one_option_left) {
      this.select(cell.index);
    }
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
