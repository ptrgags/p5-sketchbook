import { DX7Envelope } from "../DX7PatchViewer/DX7Envelope.js";
import { DX7Operator } from "../DX7PatchViewer/DX7Operator.js";
import { DX7Voice } from "../DX7PatchViewer/DX7Voice.js";
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

  /**
   * Make a best-effort conversion to a DX7 voice
   * @returns {DX7Voice}
   */
  to_dx7_voice() {
    // NOTE: Noise settings don't have an equivalent, so they are ignored.

    return new DX7Voice({
      name: this.name,
      // TODO: Convert connection to algorithm
      algorithm: 0,
      // both OPM and DX7 have feedback: 0-7
      feedback: this.channel.feedback_level,
      // TODO: Convert Operators
      operators: [
        DX7Operator.init(1),
        DX7Operator.init(2),
        DX7Operator.init(3),
        DX7Operator.init(4),
        DX7Operator.init(5),
        DX7Operator.init(6),
      ],
      // OPM doesn't have a concept of a pitch envelope
      pitch_env: DX7Envelope.DEFAULT_PITCH,
      osc_key_sync: true,
      // TODO: I still don't understand the OPM pitch settings
      transpose: 0,
    });
  }
}
