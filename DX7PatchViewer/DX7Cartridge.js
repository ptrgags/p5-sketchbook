import { DX7Voice } from "./DX7Voice.js";

/**
 * A bundle of 32 patches e.g. from a MIDI SysEx dump from a DX7
 * (or created in Dexed).
 * On the M-VAVE FM-1 these are referred to as "banks" A, B, C, D
 */
export class DX7Cartridge {
  /**
   * Constructor
   * @param {DX7Voice[]} voices An array of voices. If there are less than 32, the rest will be filled in with an INIT patch
   */
  constructor(voices) {
    while (voices.length < 32) {
      voices.push(DX7Voice.INIT);
    }
    if (voices.length > 32) {
      throw new Error("A cartridge cannot hold more than 32 voices");
    }

    this.voices = voices;
  }
}
