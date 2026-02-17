import { Note } from "./Music.js";
import { PatternGrid } from "./PatternGrid.js";

export class MusicPatterns {
  /**
   * Merge a grid of pitches and a grid of velocities
   * @template P
   * @param {PatternGrid<P>} pitches
   * @param {PatternGrid<number>} [velocities] Velocity values. If not specified, the result will assume the default velocity (mf) for every note
   * @returns {PatternGrid<Note<P>>}
   */
  static make_notes(pitches, velocities) {
    return PatternGrid.empty();
  }
}
