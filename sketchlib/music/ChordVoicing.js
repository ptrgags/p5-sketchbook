import { Rational } from "../Rational.js";
import { Harmony, make_note, Note } from "./Music.js";
import { REST } from "./pitches.js";
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
   * Subtract a chord voicing from this one, which produces an array
   * of intervals for use with move()
   * @param {ChordVoicing} other Another chord voicing
   * @returns {number[]} intervals in semitones for moving each voice
   */
  sub(other) {
    if (other.num_voices != this.num_voices) {
      throw new Error(
        "can only subtract chords with the same number of voices",
      );
    }

    return this.pitches.map((dst_pitch, i) => {
      const src_pitch = other.pitches[i];
      if (src_pitch === undefined || dst_pitch === undefined) {
        throw new Error("sub only defined for voicings without rests");
      }

      return dst_pitch - src_pitch;
    });
  }

  /**
   * Move each voice by the corresponding interval in the intervals array.
   * If the voicing has rests, those will stay as rests.
   * @param {number[]} intervals Signed intervals in semitones to move each voice
   * @returns {ChordVoicing}
   */
  move(intervals) {
    if (intervals.length !== this.num_voices) {
      throw new Error("number of intervals must match number of voices");
    }

    const pitches = this.pitches.map((x, i) =>
      x === REST ? REST : x + intervals[i],
    );
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
        x == REST ? new Gap(duration) : make_note(x, duration, velocity),
      );
    return new Harmony(...top_to_bottom);
  }
}
