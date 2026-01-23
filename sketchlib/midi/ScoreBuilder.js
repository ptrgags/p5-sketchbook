import { Score } from "../music/Score.js";
import { MIDIEvent } from "./MIDIEvent.js";

export class PartBuilder {}

export class ScoreBuilder {
  /**
   *
   * @param {number} abs_tick
   * @param {MIDIEvent} event
   */
  process_event(abs_tick, event) {
    throw new Error("not implemented");
  }

  /**
   * Build the score
   * @returns {Score<number>}
   */
  build() {
    return new Score();
  }
}
