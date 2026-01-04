/**
 * @typedef {string} Instrument
 * @typedef {string} ParamID
 */

/**
 * @template P
 * @typedef {Object} ScoreOptions
 * @property {[Instrument, import("./Music.js").Music<P>][]} parts The musical parts
 */

/**
 * A score is a container for music with instruments labeled.
 * @template P
 */
export class Score {
  /**
   * Constructor
   * @param {ScoreOptions<P>} options
   */
  constructor(options) {
    /**
     * Music parts stored in score order
     * @type {[Instrument, import("./Music.js").Music<P>][]}
     */
    this.parts = options.parts;
  }
}
