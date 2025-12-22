import { Instrument } from "./Instrument.js";
import { SoundSystem } from "./SoundSystem.js";

export class SoundEffects {
  /**
   *
   * @param {SoundSystem} sound Sound system for Tone.js
   * @param {{[instrument_id: string]: Instrument}} instruments instruments to register immediately
   * @param {[string, string, import("../music/Score.js").Music<number>][]} sfx Sound effects to register immediately
   */
  constructor(sound, instruments, sfx) {
    this.sound = sound;

    for (const [instrument_id, instrument] of Object.entries(instruments)) {
      this.register_instrument(instrument_id, instrument);
    }

    for (const [sfx_id, instrument_id, music] of sfx) {
      this.register_sfx(sfx_id, instrument_id, music);
    }
  }

  register_instrument(instrument_id, instrument) {}

  register_sfx(sfx_id, instrument_id, music) {}

  play_sfx(sfx_id) {}
}
