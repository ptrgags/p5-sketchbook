import { Instrument } from "./Instrument.js";

export class InstrumentMap {
  /**
   * Constructor
   * @param {{[instrument_id: string]: Instrument}} instruments
   */
  constructor(instruments) {
    this.instruments = new Map(Object.entries(instruments));
  }

  /**
   * Get an instrument from the map
   * @param {string} instrument_id ID of the instrument within the map
   * @return {Instrument}
   */
  get_instrument(instrument_id) {
    return this.instruments.get(instrument_id);
  }

  destroy() {
    for (const instrument of this.instruments.values()) {
      instrument.destroy();
    }
  }
}
