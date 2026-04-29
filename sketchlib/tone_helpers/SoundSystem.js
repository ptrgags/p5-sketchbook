import { BackgroundMusic } from "./BackgroundMusic.js";
import { Transport } from "./Transport.js";
import { Volume } from "./Volume.js";

/**
 * Class that owns the various music/sfx related objects.
 * It also is responsible for initializing Tone.js
 */
export class SoundSystem {
  /**
   * Constructor
   * @param {import("tone")} tone Tone module
   */
  constructor(tone) {
    this.tone = tone;
    this.transport = new Transport(tone);
    this.bgm = new BackgroundMusic(tone);
    this.volume = new Volume(tone);

    this.init_requested = false;
  }

  /**
   * Initialize Tone.js. This is typically called from PlayButtonScene
   */
  async init() {
    if (this.init_requested) {
      return;
    }
    this.init_requested = true;

    await this.tone.start();
  }
}
