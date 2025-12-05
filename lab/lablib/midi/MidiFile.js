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
Object.freeze(MIDIMessageType);

export class MIDINote {
  /**
   * Constructor
   * @param {number} tick_delta time since previous message in ticks
   * @param {number} channel Channel number in [0, 15]
   * @param {MIDIMessageType} message_type
   * @param {number} pitch MIDI note number from 0-127
   * @param {number} velocity MIDI note velocity from 0-127
   */
  constructor(tick_delta, channel, message_type, pitch, velocity) {
    this.tick_delta = tick_delta;
    this.channel = channel;
    (this.message_type = message_type), (this.pitch = pitch);
    this.velocity = velocity;
  }
}

/**
 * @enum {number}
 */
export const MIDIMetaType = {
  END_OF_TRACK: 0x2f,
  SET_TEMPO: 0x51,
  TIME_SIGNATURE: 0x58,
  KEY_SIGNATURE: 0x59,
};
Object.freeze(MIDIMetaType);

/**
 * Type for all other Meta events that I don't support
 */
export class MIDIOtherMeta {
  /**
   * Constructor
   * @param {number} tick_delta Time delta in ticks
   * @param {number} meta_type MIDIMetaType
   * @param {Uint8Array} payload Raw bytes of message
   */
  constructor(tick_delta, meta_type, payload) {
    this.tick_delta = tick_delta;
    this.meta_type = meta_type;
    this.payload = payload;
  }
}

export class MIDIEndOfTrack {
  /**
   *
   * @param {number} tick_delta
   */
  constructor(tick_delta) {
    this.tick_delta = tick_delta;
  }
}

export class MIDITimeSignature {
  /**
   * Constructor
   * @param {number} tick_delta
   * @param {number} numerator
   * @param {number} denominator
   * @param {number} midi_clocks
   * @param {number} notes32
   */
  constructor(tick_delta, numerator, denominator, midi_clocks, notes32) {
    (this.tick_delta = tick_delta), (this.numerator = numerator);
    this.denominator = denominator;
    this.midi_clocks = midi_clocks;
    this.notes32 = notes32;
  }
}

export class MIDIKeySignature {
  /**
   * Constructor
   * @param {number} tick_delta How many ticks
   * @param {number} sharps_flats positive numbers indicate sharps, negative for flats
   * @param {number} major_minor 1 for minor, 0 for major
   */
  constructor(tick_delta, sharps_flats, major_minor) {
    this.tick_delta = tick_delta;
    this.sharps_flats = sharps_flats;
    this.major_minor = major_minor;
  }
}

export class MIDISetTempo {
  /**
   *
   * @param {number} tick_delta
   * @param {number} microseconds_per_quarter
   */
  constructor(tick_delta, microseconds_per_quarter) {
    this.tick_delta = tick_delta;
    this.microseconds_per_quarter = microseconds_per_quarter;
  }
}

/**
 * * @typedef {MIDIEndOfTrack | MIDITimeSignature | MIDIKeySignature | MIDIOtherMeta} MIDIMetaEvent
 */

export class MIDISysex {
  constructor() {}
}

/**
 
 * @typedef {MIDINote | MIDIMetaEvent | MIDISysex} MIDIEvent
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
