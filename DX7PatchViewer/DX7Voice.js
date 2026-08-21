import { DX7Envelope } from "./DX7Envelope.js";
import { DX7Operator } from "./DX7Operator.js";

/**
 * Names in DX7 must be exactly 10 ASCII characters long. This takes
 * a string and enforces this.
 * @param {string} raw_name The raw name
 * @returns {string} The sanitized name
 */
function sanitize_name(raw_name) {
  const remove_non_ascii = raw_name.replace(/[^\x00-\x7F]/g, " ");
  // If the string is short, pad out to 10 chars with spaces
  const at_least_10 = remove_non_ascii.padEnd(10, " ");
  return at_least_10.substring(0, 10);
}

/**
 * @typedef {{
 *  name: string,
 *  algorithm: number,
 *  operators: DX7Operator[],
 *  pitch_env: DX7Envelope,
 *  osc_key_sync: boolean,
 *  feedback: number,
 *  transpose: number
 * }} DX7VoiceOptions
 */

/**
 * A single voice (what I would call a "patch") for a Yamaha DX7/Dexed/M-Vave FM-1
 */
export class DX7Voice {
  /**
   * Constructor
   * @param {DX7VoiceOptions} options
   */
  constructor(options) {
    if (options.operators.length !== 6) {
      throw new Error("There must be exactly 6 operators");
    }

    this.name = sanitize_name(options.name);
    this.algorithm = options.algorithm;
    this.operators = options.operators;
    this.pitch_env = options.pitch_env;
    this.osc_key_sync = options.osc_key_sync;
    this.feedback = options.feedback;
    this.transpose = options.transpose;
  }

  /**
   * Rename a voice, returning a copy
   * @param {string} name
   * @returns {DX7Voice}
   */
  rename(name) {
    return new DX7Voice({
      name,
      algorithm: this.algorithm,
      operators: this.operators,
      pitch_env: this.pitch_env,
      osc_key_sync: this.osc_key_sync,
      feedback: this.feedback,
      transpose: this.transpose,
    });
  }
}

DX7Voice.INIT = Object.freeze(
  new DX7Voice({
    name: "INIT",
    algorithm: 0,
    feedback: 0,
    operators: [
      DX7Operator.init(1),
      DX7Operator.init(2),
      DX7Operator.init(3),
      DX7Operator.init(4),
      DX7Operator.init(5),
      DX7Operator.init(6),
    ],
    pitch_env: DX7Envelope.DEFAULT_PITCH,
    osc_key_sync: true,
    transpose: 0,
  }),
);
