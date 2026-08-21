import { OPMChannel } from "./OPMChannel.js";
import { OPMLFO } from "./OPMLFO.js";
import { OPMOperator } from "./OPMOperator.js";

/**
 * @typedef {{
 *  name: string,
 *  lfo: OPMLFO,
 *  channel: OPMChannel
 *  operators: OPMOperator[],
 * }} OPMVoiceOptions
 */

export class OPMVoice {
  /**
   * Constructor
   * @param {OPMVoiceOptions} options
   */
  constructor(options) {
    this.name = options.name;
    this.lfo = options.lfo;
    this.channel = options.channel;
    this.operators = options.operators;
  }
}
