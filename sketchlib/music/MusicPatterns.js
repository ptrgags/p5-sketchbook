import { lcm } from "../gcd.js";
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
    if (!velocities) {
      // Default velocities
      return pitches.map((p) => new Note(p));
    }

    if (!pitches.duration.equals(velocities.duration)) {
      throw new Error("pitches and velocities must have the same duration");
    }

    // The two patterns take up the same amount of time but are
    // subdivided differently. Subdivide both so they match
    if (pitches.length !== velocities.length) {
      const common_length = lcm(pitches.length, velocities.length);
      pitches = pitches.subdivide(common_length / pitches.length);
      velocities = velocities.subdivide(common_length / pitches.length);
    }

    return PatternGrid.merge(pitches, velocities, (p, v) => new Note(p, v));
  }
}
