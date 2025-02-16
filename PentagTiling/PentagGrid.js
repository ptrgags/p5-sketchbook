import { PentagCell } from "./PentagCell.js";
import { Grid } from "../sketchlib/Grid.js";
import { in_bounds } from "../sketchlib/in_bounds.js";
import { opposite_side, PentagIndex } from "./PentagIndex.js";

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
      const pentag_index = PentagIndex.from_index_2d(index);

      if (!this.in_bounds(pentag_index)) {
        return undefined;
      }

      return new PentagCell(pentag_index);
    });
  }

  get_partner(cell) {
    return this.get_cell(cell.get_partner_index());
  }

  /**
   * Check if a PentagIndex is in the bounds of the grid. Since the grid
   * is a little unusual (some cells are staggered), some tiles are
   * disallowed for being slightly off-screen even though they're technically
   * in range of the array.
   * @param {PentagIndex} pentag_index The coordinates to check
   * @returns Boolean true if the pentag index is in bounds.
   */
  in_bounds(pentag_index) {
    const { row, col } = pentag_index;
    if (!in_bounds(col, row, this.cols, this.rows)) {
      return false;
    }

    if (row === this.rows - 1 && pentag_index.is_staggered) {
      return false;
    }

    return true;
  }

  get_cell(pentag_index) {
    if (!this.in_bounds(pentag_index)) {
      return undefined;
    }

    return this.grid.get(pentag_index.to_index_2d());
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
    const disconnected_side = cell.disconnected_side;
    const partner_disconnected_side = opposite_side(disconnected_side);

    const partner = this.get_cell(cell.get_partner_index());

    if (partner) {
      partner.select(partner_disconnected_side);
    }

    const one_option_left = [];

    // Update constraints for this tile's neighbors
    const neighbors = cell.get_all_neighbor_indices();
    for (const [side, neighbor_coords] of neighbors.entries()) {
      const neighbor = this.get_cell(neighbor_coords);
      if (!neighbor) {
        continue;
      }

      // To give an example, if the neighbor is in the up direction,
      // then its empty direction must not be in the down direction else
      // the arc in this tile will have nothing to connect to.
      neighbor.arc_choices[opposite_side(side)] = false;

      if (neighbor.arc_choice_count === 1) {
        one_option_left.push(neighbor);
      }
    }

    // Also update constraints for the partner tile's neighbors
    if (partner) {
      const neighbors = partner.get_all_neighbor_indices();
      for (const [side, neighbor_coords] of neighbors.entries()) {
        const neighbor = this.get_cell(neighbor_coords);
        if (!neighbor) {
          continue;
        }

        // To give an example, if the neighbor is in the up direction,
        // then its empty direction must not be in the down direction else
        // the arc in this tile will have nothing to connect to.
        neighbor.arc_choices[opposite_side(side)] = false;

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
}
