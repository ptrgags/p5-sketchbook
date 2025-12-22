import { Instrument } from "../Instrument.js";

/**
 * @implements {Instrument}
 */
export class BasicSynth {
  /**
   * Constructor
   * @param {"sine" | "triangle" | "square" | "sawtooth"} waveform One of the basic waveforms
   */
  constructor(waveform) {
    this.waveform = waveform;
  }
}
