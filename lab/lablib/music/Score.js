import { BasicSynth } from "../instruments/BasicSynth.js";
import { Instrument } from "../instruments/Instrument.js";

/**
 * @typedef {Object} PartOptions
 * @property {string} [label] Human-readable label for the track name
 * @property {number} [midi_channel=0] MIDI channel number. Defaults to 0 (Channel 1)
 * @property {number} [midi_instrument=0] MIDI instrument number. Defaults to 0 (Program 1 = Grand Piano)
 * @property {Instrument} [instrument] Instrument for playback. If not specified, a default will be provided.
 */

/**
 * @template P
 */
export class Part {
  /**
   * @param {string} id
   * @param {import("./Music.js").Music<P>} music
   * @param {PartOptions} options
   */
  constructor(id, music, options) {
    this.id = id;
    this.music = music;

    this.label = options.label ?? this.id;
    this.midi_channel = options.midi_channel ?? 0;
    this.midi_instrument = options.midi_instrument ?? 0;

    this.instrument = options.instrument ?? new BasicSynth("sine");
  }
}

/**
 * A score is a container for music with instruments labeled.
 * @template P
 */
export class Score {
  /**
   * Constructor
   * @param {Part<P>[]} parts
   */
  constructor(parts) {
    this.parts = parts;
  }
}
