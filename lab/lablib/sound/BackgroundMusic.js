import { Score } from "../music/Score.js";
import { Rational } from "../Rational.js";
import { compile_score } from "../tone_helpers/compile_music.js";
import { schedule_clips } from "../tone_helpers/schedule_music.js";
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

    this.instruments = new Map();
    this.scores = {};

    this.event_ids = [];

    for (const [instrument_id, instrument] of Object.entries(instruments)) {
      this.register_instrument(instrument_id, instrument);
    }

    for (const [score_id, score] of Object.entries(scores)) {
      this.register_score(score_id, score);
    }
  }

  register_instrument(instrument_id, instrument) {
    this.instruments.set(instrument_id, instrument);
  }

  register_score(score_id, score) {
    for (const [instrument_id] of score) {
      if (!this.instruments.has(instrument_id)) {
        throw new Error(
          `SFX instrument not found: ${instrument_id}. Did you forget to register this instrument?`
        );
      }
    }

    const compiled = compile_score(this.sound.tone, this.instruments, score);
    this.scores[score_id] = compiled;
  }

  /**
   * Play the selected score.
   * @param {string} score_id Score ID
   */
  play_score(score_id) {
    const score = this.scores[score_id];
    if (score === undefined) {
      throw new Error(`can't play unregistered score ${score_id}`);
    }

    this.stop_score();

    const transport = this.sound.tone.getTransport();
    const draw = this.sound.tone.getDraw();

    const schedule = schedule_clips(Rational.ZERO, score);
    for (const [clip, start_time, end_time] of schedule) {
      clip.material.start(start_time).stop(end_time);
    }

    this.sound.transport.set_loop(score.duration);
    this.sound.transport.play();
  }

  stop_score() {
    // TODO: need to stop the instruments
    this.sound.unschedule(this.event_ids);
    this.event_ids = [];
  }
}
