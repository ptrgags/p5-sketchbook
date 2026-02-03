import { Rational } from "../Rational.js";
import { Harmony, Note } from "./Music.js";
import { Gap } from "./Timeline.js";
import { Velocity } from "./Velocity.js";

/**
 * A specific chord voicing, i.e. an ordered
 * tuple of pitches.
 *
 * Note: voices here are listed from bottom to top (as is common in music)
 * This is different from Harmony, which concatenates from top to bottom (as you
 * would read on the page)
 */
export class ChordVoicing {
  /**
   * Constructor
   * @param {(number | undefined)[]} pitches The pitches. List them from bottom to top. Use REST to reserve room for voices that rest while the others are playing
   */
  constructor(pitches) {
    this.pitches = pitches;
  }

  get num_voices() {
    return this.pitches.length;
  }

  /**
   * Constructor
   * @param {number[]} intervals Signed intervals in semitones to move each voice
   * @returns {ChordVoicing}
   */
  move(intervals) {
    const pitches = this.pitches.map((x, i) => x + intervals[i]);
    return new ChordVoicing(pitches);
  }

  /**
   * Convert the voicing to a single chord
   * @param {Rational} duration The duration of the chord
   * @param {number} [velocity=Velocity.MF] The velocity of all notes
   * @returns {Harmony<number>} The harmony. Note that undefined voices are
   * converted to gaps. To remove them, flatten the harmony after this function.
   */
  to_harmony(duration, velocity = Velocity.MF) {
    const top_to_bottom = [...this.pitches]
      .reverse()
      .map((x) =>
        x !== undefined ? new Note(x, duration, velocity) : new Gap(duration),
      );
    return new Harmony(...top_to_bottom);
  }
}
