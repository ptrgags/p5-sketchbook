export class SoundManager {
  /**
   * Constructor
   * @param {import('tone')} tone_module The Tone.js module
   */
  constructor(tone_module) {
    this.tone = tone_module;

    this.init_requested = false;
    this.audio_ready = false;
  }

  async init() {
    if (this.init_requested) {
      return;
    }

    this.init_requested = true;

    await this.tone.start();

    this.audio_ready = true;
  }
}
