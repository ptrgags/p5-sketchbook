/**
 * Pluck envelope for e.g. string plucks and percussion hits
 */
export class PluckEnvelope {
  /**
   * Constructor
   * @param {number} decay Decay time in seconds
   */
  constructor(decay) {
    this.attack = 0;
    this.decay = decay;
    this.sustain = 0;
    this.release = decay;
  }
}

export class OrganEnvelope {
  /**
   * Constructor
   * @param {number} release Release time
   */
  constructor(release) {
    this.attack = 0;
    this.decay = 0;
    this.sustain = 1.0;
    this.release = release;
  }
}
