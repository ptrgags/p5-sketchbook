import { PentagIndex, PentagSide } from "./PentagIndex.js";

export const PentagArcType = {
  TOP_DIAG_AND_TOP: 0,
  TOP_AND_VERTICAL: 1,
  VERTICAL_AND_BOTTOM: 2,
  BOTTOM_AND_BOTTOM_DIAG: 3,
  BOTTOM_DIAG_AND_TOP_DIAG: 4,
  COUNT: 5,
};
Object.freeze(PentagArcType);

export const DISCONNECTED_SIDE_TO_ENABLED_ARCS = {
  [PentagSide.VERTICAL]: [
    PentagArcType.BOTTOM_AND_BOTTOM_DIAG,
    PentagArcType.TOP_DIAG_AND_TOP,
  ],
  [PentagSide.TOP]: [
    PentagArcType.VERTICAL_AND_BOTTOM,
    PentagArcType.BOTTOM_DIAG_AND_TOP_DIAG,
  ],
  [PentagSide.TOP_DIAG]: [
    PentagArcType.TOP_AND_VERTICAL,
    PentagArcType.BOTTOM_AND_BOTTOM_DIAG,
  ],
  [PentagSide.BOTTOM_DIAG]: [
    PentagArcType.TOP_DIAG_AND_TOP,
    PentagArcType.VERTICAL_AND_BOTTOM,
  ],
  [PentagSide.BOTTOM]: [
    PentagArcType.BOTTOM_DIAG_AND_TOP_DIAG,
    PentagArcType.TOP_AND_VERTICAL,
  ],
};

export class PentagCell {
  constructor(index) {
    if (!(index instanceof PentagIndex)) {
      throw new Error("index must be a PentagIndex");
    }
    this.index = index;

    // Once we draw curves on the tile, it will connect two pairs of
    // sides, leaving one side disconnected. When that happens, this will be set
    // to a PentagSide (see PentagIndex.js)
    this.disconnected_side = undefined;

    // This is a map from PentagSide -> whether an arc exists at this tile.
    this.arc_choices = [true, true, true, true, true];
  }

  get arc_choice_count() {
    let count = 0;
    for (const choice of this.arc_choices) {
      if (choice) {
        count++;
      }
    }
    return count;
  }

  get is_selectable() {
    return this.arc_choice_count > 0;
  }

  /**
   * Get a set of flags to determine which arcs to draw
   * @return {boolean[]} an array of 5 flags for the 5 possible arcs. Either 0 or 2 of these flags will be set.
   */
  get arc_display_flags() {
    // If the tile is completely disconnected, render nothing
    const flags = [false, false, false, false, false];

    if (!this.disconnected_side) {
      return flags;
    }

    // With one side disconnected, the other 4 sides get connected with 2
    // arcs
    const [arc1, arc2] =
      DISCONNECTED_SIDE_TO_ENABLED_ARCS[this.disconnected_side];
    flags[arc1] = true;
    flags[arc2] = true;

    return flags;
  }

  get_all_neighbor_indices() {
    const result = [];
    for (let side = 0; side < PentagSide.COUNT; side++) {
      result.push(this.index.get_neighbor(side));
    }
    return result;
  }

  /**
   * Once a tile has been selected, 4 sides have arcs that must connect to neighbors,
   * but the final side is disconnected. The adjacent tile in that direction
   * must also be disconnected (else you'd have an arc to nowhere!) so these
   * tiles are partnered up.
   * @returns {PentagIndex|undefined} The index of the partner cell (if this exists)
   */
  get_partner_index() {
    if (this.disconnected_side === undefined) {
      throw new Error("Tile doesn't have a partner yet!");
    }

    return this.index.get_neighbor(this.disconnected_side);
  }

  select_random() {
    const choice_count = this.arc_choice_count;
    if (choice_count < 1) {
      throw new Error("Can't select cell with no valid choices!");
    }

    let index;
    do {
      index = Math.floor(5 * Math.random());
    } while (!this.arc_choices[index]);
    this.disconnected_side = index;

    this.arc_choices = [false, false, false, false, false];
  }

  select(disconnected_side) {
    if (!this.arc_choices[disconnected_side]) {
      throw new Error("Can't choose that side!");
    }

    this.disconnected_side = disconnected_side;
    this.arc_choices = [false, false, false, false, false];
  }
}
