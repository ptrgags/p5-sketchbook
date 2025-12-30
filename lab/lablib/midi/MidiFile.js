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

/**
 * @interface MIDIEvent
 */
export class MIDIEvent {}

export class MIDIMessage {
  /**
   * Constructor
   * @param {number} message_type the MIDI Message type
   * @param {number} channel The channel number 0-15
   * @param {Uint8Array} data 1-3 data bytes as a u8 array
   */
  constructor(message_type, channel, data) {
    this.message_type = message_type;
    this.channel = channel;
    this.data = data;
  }

  /**
   * Shorthand for a note on event
   * @param {number} channel Channel number 0-15
   * @param {number} pitch MIDI note number
   * @param {number} [velocity=DEFAULT_VELOCITY] MIDI velocity 0-127
   * @returns {MIDIMessage} The note event
   */
  static note_on(channel, pitch, velocity = DEFAULT_VELOCITY) {
    return new MIDIMessage(
      MIDIMessageType.NOTE_ON,
      channel,
      new Uint8Array([pitch, velocity])
    );
  }

  /**
   * Shorthand for a note off event
   * @param {number} channel Channel number 0-15
   * @param {number} pitch MIDI note number
   * @param {number} [velocity=0] MIDI velocity 0-127
   * @returns {MIDIMessage} The note event
   */
  static note_off(channel, pitch, velocity = 0) {
    return new MIDIMessage(
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
 * Type for all MIDI meta events (aside from sysex)
 */
export class MIDIMetaEvent {
  /**
   * Constructor
   * @param {number} meta_type MIDIMetaType
   * @param {Uint8Array} payload Raw bytes of message
   */
  constructor(meta_type, payload) {
    this.meta_type = meta_type;
    this.payload = payload;
  }
}
MIDIMetaEvent.END_OF_TRACK = Object.freeze(
  new MIDIMetaEvent(MIDIMetaType.END_OF_TRACK, new Uint8Array(0))
);

/**
 * @implements {MIDIEvent}
 */
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
 * MIDI track with absolute tick deltas from the start of the track.
 * This is used internally for easier comparisons in unit tests and converting
 * MIDI to scores.
 */
export class AbsoluteTimingTrack {
  /**
   * constructor
   * @param {[number, MIDIEvent][]} events Pairs of (absolute_t, msg)
   */
  constructor(events) {
    this.events = events;
  }
}

/**
 * MIDI track with tick deltas relative to the previous message. This is
 * required for encoding to a MIDI file.
 */
export class RelativeTimingTrack {
  /**
   * constructor
   * @param {[number, MIDIEvent][]} events Pairs of (relative_t, msg)
   */
  constructor(events) {
    this.events = events;
  }
}

/**
 * MIDI file as a collection of messages
 *
 * @template T The track type, either AbsoluteTimingTrack or RelativeTimingTrack
 */
export class MIDIFile {
  /**
   * Constructor
   * @param {MIDIHeader} header The file header
   * @param {T[]} tracks One or more tracks
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
