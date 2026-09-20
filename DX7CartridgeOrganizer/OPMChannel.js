/**
 * @typedef {{
 *  channel_enable: number,
 *  feedback_level: number,
 *  connection: number,
 *  amp_mod_sensitivity: number,
 *  pitch_mod_sensitivity: number,
 *  slot_mask: number
 *  noise_enable: boolean
 * }} OPMChannelOptions
 */

export class OPMChannel {
  /**
   *
   * @param {OPMChannelOptions} options
   */
  constructor(options) {
    this.channel_enable = options.channel_enable;
    this.feedback_level = options.feedback_level;
    this.connection = options.connection;
    this.amp_mod_sensitivity = options.amp_mod_sensitivity;
    this.pitch_mod_sensitivity = options.pitch_mod_sensitivity;
    this.slot_mask = options.slot_mask;
    this.noise_enable = options.noise_enable;
  }
}
