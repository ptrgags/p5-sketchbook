export class FountainPen {
  constructor(color, capacity) {
    this.color = color;
    this.capacity = capacity;
  }
}

export class FountainPenCase {
  constructor(pens, available_colors, max_capacity, next_color) {
    this.pens = pens;
    this.available_colors = available_colors;
    this.max_capacity = max_capacity;
    this.next_color = next_color;
  }

  next_iter(ink_usage) {
    const pen_count = this.pens.length;
    if (ink_usage.length !== pen_count) {
      throw new Error(`usage must be an array of ${pen_count} numbers`);
    }

    // Subtract the ink usage, and if there's still ink remaining, create
    // a corresponding pen with the same color but with reduced capacity
    let next_index = 0;
    const next_pens = new Array(pen_count);
    for (const [i, pen] of this.pens.entries()) {
      const usage = ink_usage[i];
      if (pen.capacity - usage > 0) {
        next_pens[next_index] = new FountainPen(
          pen.color,
          pen.capacity - usage
        );
        next_index++;
      }
    }

    const palette_length = this.available_colors.length;
    while (next_index < pen_count) {
      next_pens[next_index] = new FountainPen(
        this.available_colors[this.next_color % palette_length],
        this.max_capacity
      );
      next_index++;
      this.next_color++;
    }

    return new FountainPenCase(
      next_pens,
      this.available_colors,
      this.max_capacity,
      this.next_color
    );
  }
}
