import { Score } from "../music/Score.js";
import { Instrument } from "./Instrument.js";
import { SoundSystem } from "./SoundSystem.js";

export class BackgroundMusic {
  /**
   * Constructor
   * @param {SoundSystem} sound Sound system for interacting with Tone.js
   * @param {{[instrument_id: string]: Instrument}} instruments Instruments to register immediately
   * @param {{[score_id: string]: Score<number>}} scores Scores to register immediately
   */
  constructor(sound, instruments, scores) {
    this.sound = sound;

    for (const [instrument_id, instrument] of Object.entries(instruments)) {
      this.register_instrument(instrument_id, instrument);
    }

    for (const [score_id, score] of Object.entries(scores)) {
      this.register_score(score_id, score);
    }
  }

  register_instrument(instrument_id, instrument) {}

  register_score(score_id, score) {}

  play_score(score_id) {}

  stop_score() {}
}
