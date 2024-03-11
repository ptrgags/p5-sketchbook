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
    return this.arc_choice_count > 1;
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

  get_partner() {
    if (this.arc_type === undefined) {
      throw new Error("Can't get partner without an arc type!");
    }

    const col_direction = this.is_flipped ? -1 : 1;

    // Flat side
    if (this.arc_type === 0) {
      return [this.row, this.col - col_direction];
    }

    // Top side
    if (this.arc_type === 1) {
      return [this.row - 1, this.col];
    }

    // Top diagonal
    if (this.arc_type === 2) {
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

    // Bottom diagonal
    if (this.arc_type === 3) {
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

    // Bottom side
    return [this.row + 1, this.col];
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
    this.arc_choices[index] = true;
  }

  select(arc_type) {
    if (!this.arc_choices[arc_type]) {
      throw new Error("Invalid arc type!");
    }

    this.arc_type = arc_type;
    this.arc_choices = [false, false, false, false, false];
    this.arc_choices[arc_type] = true;
  }
}
