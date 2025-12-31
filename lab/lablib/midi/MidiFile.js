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
MIDIHeader.CHUNK_LENGTH = 3;
MIDIHeader.DEFAULT_FORMAT0 = Object.freeze(
  new MIDIHeader(MIDIFormat.SINGLE_TRACK, 1)
);

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
export class MIDIEvent {
  /**
   * For unit tests, store the data bytes in an array to use as a sort key
   * @type {number[]}
   */
  get sort_key() {
    throw new Error("not implemented");
  }

  /**
   * How long will the message be when written in binary (counting any implicit bytes)
   * @type {number}
   */
  get byte_length() {
    throw new Error("not implemented");
  }
}

/**
 * Basic MIDI Message
 * @implements {MIDIEvent}
 */
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

  get sort_key() {
    const status_byte = (this.message_type << 4) | this.channel;
    return [status_byte, ...this.data];
  }

  get byte_length() {
    // status byte + payload
    return 1 + this.data.length;
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
 * @implements {MIDIEvent}
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

  /**
   * @type {number[]}
   */
  get sort_key() {
    return [MIDIMetaEvent.MAGIC, this.meta_type, ...this.payload];
  }

  get byte_length() {
    // 3 byte header + payload
    return 3 + this.payload.length;
  }
}
MIDIMetaEvent.MAGIC = 0xff;
MIDIMetaEvent.END_OF_TRACK = Object.freeze(
  new MIDIMetaEvent(MIDIMetaType.END_OF_TRACK, new Uint8Array(0))
);

/**
 * @implements {MIDIEvent}
 */
export class MIDISysex {
  /**
   * Constructor
   * @param {Uint8Array} data Payload of the sysex message
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * @type {number[]}
   */
  get sort_key() {
    return [MIDISysex.MAGIC, ...this.data];
  }

  get byte_length() {
    // F7 + length + payload length
    return 2 + this.data.length;
  }
}
MIDISysex.MAGIC = 0xf7;

/**
 * MIDITrack interface
 * @interface MIDITrack
 */
export class MIDITrack {
  /**
   * For unit tests, convert to a comparable form by sorting
   * @returns {[number, MIDIEvent][]}
   */
  to_testable() {
    throw new Error("Not implemented");
  }
}

/**
 * Sort comparison function for two numeric arrays - sort first by length,
 * then in lexicographic order
 * @param {number[]} a First array
 * @param {number[]} b Second Array
 * @return {number} positive if a should come later, negative if a should come first, 0 if equal
 */
function compare_shortlex(a, b) {
  // First, sort by length ascending
  if (a.length !== b.length) {
    return a.length - b.length;
  }

  // Now, compare entries. The first nonzero one is used.
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      continue;
    }

    return a[i] - b[i];
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

  /**
   * Convert absolute ticks to relative deltas
   * @returns {RelativeTimingTrack}
   */
  to_relative() {
    /**
     * @type {[number, MIDIEvent][]}
     */
    const events = [];

    let prev_tick = 0;
    for (const [absolute_tick, msg] of this.events) {
      const delta = absolute_tick - prev_tick;
      events.push([delta, msg]);
      prev_tick = absolute_tick;
    }
    return new RelativeTimingTrack(events);
  }

  /**
   * For unit tests, convert to a comparable form by sorting
   * @returns {[number, MIDIEvent][]}
   */
  to_testable() {
    const sorted = this.events.slice();
    sorted.sort((a, b) => {
      const [t_a, msg_a] = a;
      const [t_b, msg_b] = b;

      return compare_shortlex(
        [t_a, ...msg_a.sort_key],
        [t_b, ...msg_b.sort_key]
      );
    });
    return sorted;
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

  /**
   * Convert relative deltas to absolute times
   * @returns {AbsoluteTimingTrack}
   */
  to_absolute() {
    /**
     * @type {[number, MIDIEvent][]}
     */
    const events = [];

    let current_tick = 0;
    for (const [delta, msg] of this.events) {
      const absolute_tick = current_tick + delta;
      events.push([absolute_tick, msg]);
      current_tick = absolute_tick;
    }

    return new AbsoluteTimingTrack(events);
  }

  /**
   * For unit tests, convert to a comparable form via sorting
   * @returns {[number, MIDIEvent][]}
   */
  to_testable() {
    return this.to_absolute().to_testable();
  }
}

/**
 * MIDI file as a collection of messages
 *
 * @template {MIDITrack} T The track type, either AbsoluteTimingTrack or RelativeTimingTrack
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

  /**
   * For each track, return a testable list of events
   * @returns {[number, MIDIEvent][][]}
   */
  to_testable() {
    return this.tracks.map((x) => x.to_testable());
  }
}
