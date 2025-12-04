/**
 * @enum {number}
 */
export const MIDIFormat = {
  SINGLE_TRACK: 0,
  MULTI_PARALLEL: 1,
  MULTI_SEQUENCE: 2,
};
Object.freeze(MIDIFormat);

export class MIDIHeader {
  /**
   * Constructor
   * @param {MIDIFormat} format MIDI format
   * @param {number} num_tracks Number of tracks in the file
   * @param {number} ticks_per_quarter How many ticks per quarter note
   */
  constructor(format, num_tracks, ticks_per_quarter) {
    this.format = format;
    this.num_tracks = num_tracks;
    this.ticks_per_quarter = ticks_per_quarter;
  }
}

/**
 * @enum {number}
 */
export const MIDIMessageType = {
  NOTE_OFF: 0b100,
  NOTE_ON: 0b1001,
};
Object.freeze(MIDIFormat);

export class MIDIMessage {
  constructor() {}
}

export class MIDIMetaEvent {
  constructor() {}
}

export class MIDISysex {
  constructor() {}
}

/**
 * @typedef {MIDIMessage | MIDIMetaEvent | MIDISysex} MIDIEvent
 */

export class MIDITrack {
  /**
   * constructor
   * @param {MIDIEvent[]} events
   */
  constructor(events) {
    this.events = events;
  }
}

export class MIDIFile {
  /**
   * Constructor
   * @param {MIDIHeader} header The file header
   * @param {MIDITrack[]} tracks One or more tracks
   */
  constructor(header, tracks) {
    this.header = header;
    this.tracks = tracks;

    if (this.header.num_tracks !== this.tracks.length) {
      throw new Error(
        `incorrect number of tracks, expected ${this.header.num_tracks}, got ${this.tracks.length}`
      );
    }
  }
}
