import { DX7Envelope } from "./DX7Envelope.js";
import { DX7LFO } from "./DX7LFO.js";
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
 *  lfo: DX7LFO,
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
   * @param {DX7VoiceOptions} options Options. note that values are stored in packed format like in the binary
   */
  constructor(options) {
    if (options.operators.length !== 6) {
      throw new Error("There must be exactly 6 operators");
    }

    this.name = sanitize_name(options.name);
    this.algorithm = options.algorithm;
    this.operators = options.operators;
    this.pitch_env = options.pitch_env;
    this.lfo = options.lfo;
    this.osc_key_sync = options.osc_key_sync;
    this.feedback = options.feedback;
    // note: this is stored as 0-14, but this.transpose_display converts to -7-7
    this.transpose = options.transpose;
  }

  /**
   * Return the human-readable algorithm number from 1-32
   * @type {number}
   */
  get algorithm_display() {
    return this.algorithm + 1;
  }

  /**
   * Get the human-readable transpose from -7 to 7
   * @type {number}
   */
  get transpose_display() {
    return this.transpose - 7;
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
      lfo: this.lfo,
      osc_key_sync: this.osc_key_sync,
      feedback: this.feedback,
      transpose: this.transpose,
    });
  }
}

DX7Voice.INIT = Object.freeze(
  new DX7Voice({
    name: "--INIT--",
    algorithm: 0,
    feedback: 0,
    operators: [
      DX7Operator.init(1, 99),
      DX7Operator.init(2, 0),
      DX7Operator.init(3, 0),
      DX7Operator.init(4, 0),
      DX7Operator.init(5, 0),
      DX7Operator.init(6, 0),
    ],
    pitch_env: DX7Envelope.DEFAULT_PITCH,
    lfo: DX7LFO.INIT,
    osc_key_sync: true,
    // transpose 0 is stored unsigned as 7
    transpose: 7,
  }),
);
