/**
 * @typedef {Object} SFXDescriptor
 * @property {string} url URL to sound file
 * @property {number} [volume] volume in decibels
 */

/**
 * An object that represents a listing of all the sounds needed for a sketch so
 * they can be preloaded/configured
 * @typedef {Object} SoundManifest
 * @property {Object.<string, SFXDescriptor>} sfx A dictionary of SFX ID to descriptor of the sound
 */

/**
 * Very basic sound manager using Tone.js
 *
 * Important: SoundManager.init() must be called from a user input else
 * the audio context won't be started.
 */
export class SoundManager {
  /**
   * Constructor
   * @param {any} tone Tone.js module.
   * @param {*} manifest
   */
  constructor(tone, manifest) {
    this.tone = tone;
    this.player = undefined;
    this.audio_ready = true;
    this.sound_manifest = manifest;
    this.sfx = {};
  }

  async init() {
    // idempotent
    if (this.init_requested) {
      return;
    }

    this.init_requested = true;

    await this.tone.start();
    await this.load_sounds();
    await this.tone.loaded();

    this.audio_ready = true;
  }

  async load_sounds() {
    for (const [id, sound_info] of Object.entries(this.sound_manifest.sfx)) {
      const sfx = new this.tone.Player(sound_info.url).toDestination();
      if (sound_info.volume) {
        sfx.volume.value = sound_info.volume;
      }
      this.sfx[id] = sfx;
    }
  }

  /**
   * Play a sound effect. This only works once the audio is ready
   * @param {string} sfx_id A sound effect ID matching one declared in the manifest
   * @returns
   */
  async play_sfx(sfx_id) {
    if (!this.audio_ready) {
      return;
    }

    const sfx = this.sfx[sfx_id];
    if (!sfx) {
      throw new Error(`unknown SFX ${sfx_id}`);
    }

    sfx.start();
  }
}
