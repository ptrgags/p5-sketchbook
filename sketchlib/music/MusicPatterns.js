import { lcm } from "../gcd.js";
import { Note } from "./Music.js";
import { PatternGrid } from "./PatternGrid.js";
import { Rhythm } from "./Rhythm.js";

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

    return PatternGrid.merge(pitches, velocities, (p, v) => new Note(p, v));
  }

  /**
   * Compose a melody. This is a wrapper around MusicPatterns.make_notes + Rhythm.zip
   * @template P
   * @param {Rhythm} rhythm The rhythm of the melody
   * @param {P[]} pitches The pitches (one per beat)
   * @param {number[]} [velocities] The velocities (one per beat)
   */
  static melody(rhythm, pitches, velocities) {
    let notes = velocities
      ? pitches.map((p, i) => new Note(p, velocities[i]))
      : pitches.map((p) => new Note(p));

    return rhythm.zip(notes);
  }
}
