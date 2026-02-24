import { init } from "p5";
import { Instrument } from "./Instrument.js";

/**
 * @enum {number}
 */
export const Polyphony = {
  MONOPHONIC: 0,
  POLYPHONIC: 1,
};
Object.freeze(Polyphony);

export class InstrumentMap {
  /**
   * Constructor
   * @param {{[instrument_id: string]: Instrument}} instruments
   */
  constructor(instruments) {
    this.instruments = instruments;
  }

  init_synths(tone, polyphony_map) {
    for (const [instrument_id, polyphony] of polyphony_map) {
      const instrument = this.instruments[instrument_id];
      if (!instrument) {
        throw new Error(`can't find instrument ${instrument_id}`);
      }

      this.instruments[instrument_id].init(tone, polyphony);
    }
  }

  /**
   * Set the volume of many instruments at once
   * @param {{[instrument_id: string]: number}} volume_map
   */
  mix(volume_map) {
    for (const [instrument_id, volume] of Object.entries(volume_map)) {
      const instrument = this.instruments[instrument_id];
      if (!instrument) {
        throw new Error(`can't find instrument ${instrument_id}`);
      }

      instrument.volume = volume;
    }
  }

  /**
   * Get an instrument from the map
   * @param {string} instrument_id
   * @returns {Instrument | undefined}
   */
  get(instrument_id) {
    return this.instruments[instrument_id];
  }

  release_all() {
    for (const instrument of Object.values(this.instruments)) {
      instrument.release_all();
    }
  }
}
