import { Score } from "../music/Score.js";

export class PartBuilder {}

export class ScoreBuilder {
  /**
   * Build the score
   * @returns {Score<number>}
   */
  build() {
    return new Score();
  }
}
