import { Instrument, Polyphony } from "./Instrument.js";

export class InstrumentMap {
  /**
   * Constructor
   * @param {{[instrument_id: string]: Instrument}} instruments
   */
  constructor(instruments) {
    this.instruments = instruments;
  }

  /**
   *
   * @param {import("tone")} tone
   * @param {{[instrument_id: string]: Polyphony}} polyphony_map
   */
  init_synths(tone, polyphony_map) {
    const destination = tone.getDestination();

    for (const [instrument_id, polyphony] of Object.entries(polyphony_map)) {
      const instrument = this.instruments[instrument_id];
      if (!instrument) {
        throw new Error(`can't find instrument ${instrument_id}`);
      }

      this.instruments[instrument_id].init(tone, polyphony, destination);
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
