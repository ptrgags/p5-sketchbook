/**
 * Simple data structure for representing a fountain pen with colored
 * ink and a certain capacity
 */
export class FountainPen {
  /**
   * Constructor
   * @param {HSVColor} color The ink color
   * @param {number} capacity The ink capacity
   */
  constructor(color, capacity) {
    this.color = color;
    this.capacity = capacity;
  }
}

/**
 * A case of fountain pens, treated as a circular buffer. Each day, I
 * use the next available pen. When one runs out of ink, I remove it from the
 * list for cleaning, and add a new pen with a different color at the end.
 * This class simulates the state for one traversal of the pen case. the
 * next_iter() method computes the next state.
 */
export class FountainPenCase {
  /**
   *
   * @param {FountainPen[]} pens The initial set of pens in the pen case.
   * @param {HSVColor} available_colors The available ink colors for the pens,
   * used as another circular buffer for picking colors. There can be more ink
   * colors than pens
   * @param {number} max_capacity The maximum capacity for pens when new ones
   * are created
   * @param {number} next_color The index of the next color from
   * available_colorsto use the first time a pen runs out of ink.
   */
  constructor(pens, available_colors, max_capacity, next_color) {
    this.pens = pens;
    this.available_colors = available_colors;
    this.max_capacity = max_capacity;
    this.next_color = next_color;
  }

  /**
   * Compute the next iteration of the simulation. This is done immutably,
   * the result is
   * @param {number[]} ink_usage Array with one number per pen in the pen case
   * representing how much ink capacity was used for each pen
   * @returns {FountainPenCase} A new FountainPenCase representing the state
   * after going through every pen.
   */
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
