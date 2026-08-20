export class DX7Envelope {
  /**
   * Constructor
   * @param {number[]} rates 4 rate values in [0, 99]
   * @param {number[]} levels 4 level values in [0, 99].
   */
  constructor(rates, levels) {
    if (rates.length !== 4) {
      throw new Error("rates must have exactly 4 values");
    }

    if (levels.length !== 4) {
      throw new Error("levels must have exactly 4 values");
    }

    this.rates = rates;
    this.levels = levels;
  }

  toString() {
    `R:${this.rates} L: ${this.levels}`;
  }
}

DX7Envelope.DEFAULT_ENV = Object.freeze(
  new DX7Envelope([99, 99, 99, 99], [99, 99, 99, 0]),
);
DX7Envelope.DEFAULT_PITCH = Object.freeze(
  new DX7Envelope([50, 50, 50, 50], [99, 99, 99, 99]),
);
