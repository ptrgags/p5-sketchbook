import { compile_music } from "../tone_helpers/compile_music.js";
import { Instrument } from "./Instrument.js";
import { SoundSystem } from "./SoundSystem.js";

export class SoundEffects {
  /**
   *
   * @param {SoundSystem} sound Sound system for Tone.js
   * @param {{[instrument_id: string]: Instrument}} instruments instruments to register immediately
   * @param {[string, string, import("../music/Score.js").Music<number>][]} sfx List of (sfx_id, instrument_id, music)
   */
  constructor(sound, instruments, sfx) {
    this.sound = sound;

    /**
     * Map of ID -> instrument
     * @type {Map<string, Instrument>}
     */
    this.instruments = new Map();

    /**
     * Map of sfx_id -> instrument
     */
    this.instrument_ids = new Map();

    /**
     * Map of ID -> sfx music
     * @type {Map<string, import("../music/Score.js").Music<number>>}
     */
    this.sfx_music = new Map();

    /**
     * Map of sfx_id -> compiled SFX clips
     */
    this.sfx_clips = new Map();

    for (const [instrument_id, instrument] of Object.entries(instruments)) {
      this.register_instrument(instrument_id, instrument);
    }

    for (const [sfx_id, instrument_id, score] of sfx) {
      this.register_sfx(sfx_id, instrument_id, score);
    }
  }

  register_instrument(instrument_id, instrument) {
    this.instruments.set(instrument_id, instrument);
  }

  register_sfx(sfx_id, instrument_id, score) {
    for (const [instrument_id] of score) {
      if (!this.instruments.has(instrument_id)) {
        throw new Error(
          `SFX instrument not found: ${instrument_id}. Did you forget to register this instrument?`
        );
      }
    }
    this.instrument_ids.set(sfx_id, instrument_id);
    this.sfx_music.set(sfx_id, score);
  }

  compile_scores() {
    for (const [sfx_id, music] of this.sfx_music.entries()) {
      const instrument_id = this.instrument_ids.get(sfx_id);
      const instrument = this.instruments.get(instrument_id);
      const clips = compile_music(this.sound.tone, instrument.synth, music);
      this.sfx_clips.set(sfx_id, clips);
    }
  }

  play_sfx(sfx_id) {}
}
