import { Style } from "../Style.js";

export class StyleRuns {
  /**
   * Constructor
   * @param {[number, Style][]} runs Array of (count, Style) pairs
   */
  constructor(runs) {
    this.runs = runs;
  }

  /**
   * Iterate over the runs, returning (start_index, end_index, Style)
   * where the indices indicate a half-open range [start_index, end_index)
   * @returns {Generator<[number, number, Style]>}
   */
  *iter() {
    let offset = 0;
    for (const [n, style] of this.runs) {
      yield [offset, offset + n, style];
      offset += n;
    }
  }

  /**
   * Map a flat array of styles to runs of length 1. This is intended for
   * cases where every primitive gets a different style.
   * @param {Style[]} styles The styles to use
   * @returns {StyleRuns}
   */
  static from_styles(styles) {
    return new StyleRuns(styles.map((s) => [1, s]));
  }

  /**
   * Convenience function for collections of primitives to loop over the style
   * runs and apply styles. It also supports a single style over the whole range
   * @param {import("p5")} p
   * @param {number} n Total number of primitives that will be rendered
   * @param {Style | StyleRuns} styles either a single style to apply to the whole collection, or a run of styles
   * @param {function(number, number): void} draw_func draw(start, end) is for drawing the primitives at the specified indices
   */
  static draw_styled(p, n, styles, draw_func) {
    if (styles instanceof Style) {
      styles.apply(p);
      draw_func(0, n);
    } else {
      for (const [start, end, style] of styles.iter()) {
        style.apply(p);
        draw_func(start, end);
      }
    }
  }
}
