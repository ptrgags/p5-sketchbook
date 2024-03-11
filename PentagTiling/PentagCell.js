const SIDE_VERTICAL = 0;
const SIDE_TOP = 1;
const SIDE_TOP_DIAG = 2;
const SIDE_BOTTOM_DIAG = 3;
const SIDE_BOTTOM = 4;

export class PentagCell {
  constructor(row, col) {
    this.row = row;
    this.col = col;

    this.arc_type = undefined;
    this.arc_choices = [true, true, true, true, true];
  }

  get is_flipped() {
    return this.col % 2 === 1;
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

  get arc_flags() {
    switch (this.arc_type) {
      case 0:
        return [true, false, false, true, false];
      case 1:
        return [false, false, true, false, true];
      case 2:
        return [false, true, false, true, false];
      case 3:
        return [true, false, true, false, false];
      case 4:
        return [false, true, false, false, true];
    }

    return [false, false, false, false];
  }

  get_neighbor(side) {
    const col_direction = this.is_flipped ? -1 : 1;

    if (side === SIDE_VERTICAL) {
      return [this.row, this.col - col_direction];
    }

    if (side === SIDE_TOP) {
      return [this.row - 1, this.col];
    }

    if (side === SIDE_TOP_DIAG) {
      switch (this.col % 4) {
        case 0:
          return [this.row - 1, this.col + 1];
        case 1:
          return [this.row, this.col - 1];
        case 2:
          return [this.row, this.col + 1];
        case 3:
          return [this.row - 1, this.col - 1];
      }
    }

    if (side === SIDE_BOTTOM_DIAG) {
      switch (this.col % 4) {
        case 0:
          return [this.row, this.col + 1];
        case 1:
          return [this.row + 1, this.col - 1];
        case 2:
          return [this.row + 1, this.col + 1];
        case 3:
          return [this.row, this.col - 1];
      }
    }

    return [this.row + 1, this.col];
  }

  get all_neighbors() {
    const result = [];
    for (let i = 0; i < 5; i++) {
      result.push(this.get_neighbor(i));
    }
    return result;
  }

  get_partner() {
    if (this.arc_type === undefined) {
      throw new Error("Can't get partner without an arc type!");
    }

    return this.get_neighbor(this.arc_type);
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
    this.arc_type = index;

    this.arc_choices = [false, false, false, false, false];
  }

  select(arc_type) {
    if (!this.arc_choices[arc_type]) {
      throw new Error("Invalid arc type!");
    }

    this.arc_type = arc_type;
    this.arc_choices = [false, false, false, false, false];
  }
}
