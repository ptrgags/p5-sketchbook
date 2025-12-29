export const DEFAULT_TICKS_PER_QUARTER = 96;
export const DEFAULT_VELOCITY = 127;

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
   * @param {number} [ticks_per_quarter=DEFAULT_TICKS_PER_QUARTER] How many ticks per quarter note
   */
  constructor(
    format,
    num_tracks,
    ticks_per_quarter = DEFAULT_TICKS_PER_QUARTER
  ) {
    this.format = format;
    this.num_tracks = num_tracks;
    this.ticks_per_quarter = ticks_per_quarter;
  }
}

/**
 * @enum {number}
 */
export const MIDIMessageType = {
  NOTE_OFF: 0b1000,
  NOTE_ON: 0b1001,
  POLY_AFTERTOUCH: 0b1010,
  CONTROL_CHANGE: 0b1011,
  PROGRAM_CHANGE: 0b1100,
  CHANNEL_AFTERTOUCH: 0b1101,
  PITCH_BEND: 0b1110,
  CHANNEL_MODE: 0b1011,
  SYSTEM: 0b1111,
};
Object.freeze(MIDIMessageType);

/**
 * Get the length of a MIDI message (not including meta or sysex events)
 * @param {number} message_type The MIDI message type
 * @returns {0 | 1 | 2} The number of data bytes for this message type.
 */
export function get_data_length(message_type) {
  switch (message_type) {
    case MIDIMessageType.NOTE_OFF:
    case MIDIMessageType.NOTE_ON:
    case MIDIMessageType.POLY_AFTERTOUCH:
    case MIDIMessageType.CONTROL_CHANGE:
    case MIDIMessageType.PITCH_BEND:
    case MIDIMessageType.CHANNEL_MODE:
      return 2;
    case MIDIMessageType.PROGRAM_CHANGE:
    case MIDIMessageType.CHANNEL_AFTERTOUCH:
      return 1;
    default:
      return 0;
  }
}

export class MIDIMessage {
  /**
   * Constructor
   * @param {number} tick_delta time since the previous message in ticks
   * @param {number} message_type the MIDI Message type
   * @param {number} channel The channel number 0-15
   * @param {Uint8Array} data 1-3 data bytes as a u8 array
   */
  constructor(tick_delta, message_type, channel, data) {
    this.tick_delta = tick_delta;
    this.message_type = message_type;
    this.channel = channel;
    this.data = data;
  }

  /**
   * Shorthand for a note on event
   * @param {number} tick_delta Time delta for message
   * @param {number} channel Channel number 0-15
   * @param {number} pitch MIDI note number
   * @param {number} [velocity=DEFAULT_VELOCITY] MIDI velocity 0-127
   * @returns {MIDIMessage} The note event
   */
  static note_on(tick_delta, channel, pitch, velocity = DEFAULT_VELOCITY) {
    return new MIDIMessage(
      tick_delta,
      MIDIMessageType.NOTE_ON,
      channel,
      new Uint8Array([pitch, velocity])
    );
  }

  /**
   * Shorthand for a note off event
   * @param {number} tick_delta Time delta for message
   * @param {number} channel Channel number 0-15
   * @param {number} pitch MIDI note number
   * @param {number} [velocity=0] MIDI velocity 0-127
   * @returns {MIDIMessage} The note event
   */
  static note_off(tick_delta, channel, pitch, velocity = 0) {
    return new MIDIMessage(
      tick_delta,
      MIDIMessageType.NOTE_OFF,
      channel,
      new Uint8Array([pitch, velocity])
    );
  }
}

/**
 * @enum {number}
 */
export const MIDIMetaType = {
  SEQUENCE_NUMBER: 0x00,
  TEXT: 0x01,
  COPYRIGHT: 0x02,
  TRACK_NAME: 0x03,
  LYRIC: 0x05,
  MARKER: 0x06,
  CUE_POINT: 0x07,
  CHANNEL_PREFIX: 0x20,
  END_OF_TRACK: 0x2f,
  SET_TEMPO: 0x51,
  SMPTE_OFFSET: 0x54,
  TIME_SIGNATURE: 0x58,
  KEY_SIGNATURE: 0x59,
  SEQUENCER_SPECIFIC: 0x7f,
};
Object.freeze(MIDIMetaType);

/**
 * Type for all other Meta events that I don't support
 */
export class MIDIMetaEvent {
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

  /**
   * Shorthand for making an end of track message
   * @param {number} tick_delta
   * @returns
   */
  static end_of_track(tick_delta) {
    return new MIDIMetaEvent(
      tick_delta,
      MIDIMetaType.END_OF_TRACK,
      new Uint8Array(0)
    );
  }
}

export class MIDISysex {
  /**
   * Constructor
   * @param {number} tick_delta Time delta in ticks
   * @param {Uint8Array} data Payload of the sysex message
   */
  constructor(tick_delta, data) {
    this.tick_delta = tick_delta;
    this.data = data;
  }
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
