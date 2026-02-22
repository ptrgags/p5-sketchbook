import { Velocity } from "../music/Velocity.js";
import { decode_variable_length } from "./variable_length.js";

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

  /**
   * Encode the message to binary
   * @param {DataView} data_view DataView to write to
   * @param {number} offset Starting offset
   * @return {number} New offset after writing
   */
  encode(data_view, offset) {
    throw new Error("not implemented");
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
   * Encode the message to binary
   * @param {DataView} data_view DataView to write to
   * @param {number} offset Starting offset
   * @return {number} New offset after writing
   */
  encode(data_view, offset) {
    const status_byte = (this.message_type << 4) | this.channel;
    data_view.setUint8(offset, status_byte);
    offset++;

    for (const [i, x] of this.data.entries()) {
      data_view.setUint8(offset + i, x);
    }
    offset += this.data.length;

    return offset;
  }

  /**
   * Shorthand for a note on event
   * @param {number} channel Channel number 0-15
   * @param {number} pitch MIDI note number
   * @param {number} [velocity=MIDIMessage.DEFAULT_VELOCITY] MIDI velocity 0-127
   * @returns {MIDIMessage} The note event
   */
  static note_on(channel, pitch, velocity = MIDIMessage.DEFAULT_VELOCITY) {
    // note on with velocity 0 is the same as a note off. See the
    // MIDI 1.0 Detailed Specification

    const message_type =
      velocity === 0 ? MIDIMessageType.NOTE_OFF : MIDIMessageType.NOTE_ON;

    return new MIDIMessage(
      message_type,
      channel,
      new Uint8Array([pitch, velocity]),
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
      new Uint8Array([pitch, velocity]),
    );
  }

  /**
   *
   * @param {number} channel
   * @param {number} instrument Instrument number
   */
  static program_change(channel, instrument) {
    return new MIDIMessage(
      MIDIMessageType.PROGRAM_CHANGE,
      channel,
      new Uint8Array([instrument]),
    );
  }

  /**
   * Decode a single MIDI message from binary
   * @param {number} running_status Running status byte - sometimes this is implicit, so it is passed in by the decoder rather than read from the array
   * @param {DataView} data_view DataView to read from
   * @param {number} offset Byte offset of the first data byte within the DataView. this is the byte _after_ the status byte (when present)
   * @returns {[MIDIMessage, number]} (message, after_offset)
   */
  static decode(running_status, data_view, offset) {
    const message_type = running_status >> 4;
    const channel = running_status & 0xf;

    const data_length = get_data_length(message_type);
    const data = new Uint8Array(
      data_view.buffer,
      data_view.byteOffset + offset,
      data_length,
    );

    const msg = new MIDIMessage(message_type, channel, data);
    const after_offset = offset + data_length;
    return [msg, after_offset];
  }
}
MIDIMessage.DEFAULT_VELOCITY = Velocity.MF;

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
   * @param {Uint8Array} data Raw bytes of message
   */
  constructor(meta_type, data) {
    this.meta_type = meta_type;
    this.data = data;
  }

  /**
   * @type {number[]}
   */
  get sort_key() {
    return [MIDIMetaEvent.MAGIC, this.meta_type, ...this.data];
  }

  get byte_length() {
    // 3 byte header + data
    return 3 + this.data.length;
  }

  /**
   * Encode the message to binary
   * @param {DataView} data_view DataView to write to
   * @param {number} offset Starting offset
   * @return {number} New offset after writing
   */
  encode(data_view, offset) {
    data_view.setUint8(offset, MIDIMetaEvent.MAGIC);
    data_view.setUint8(offset + 1, this.meta_type);
    // NB: This should be a variable length quantity... but my music system
    // doesn't produce any text or sysex messages at present, so the length
    // will always fit within 7 bits. If that ever changes, use
    // encode_variable_length() here and in the Sysex message
    data_view.setUint8(offset + 2, this.data.length);
    offset += 3;

    for (const [i, x] of this.data.entries()) {
      data_view.setUint8(offset + i, x);
    }
    offset += this.data.length;

    return offset;
  }

  /**
   * Track Name event
   * @param {string} track_name Track name. This method only supports ASCII characters
   */
  static track_name(track_name) {
    const encoded_name = new Uint8Array(track_name.length);
    for (let i = 0; i < track_name.length; i++) {
      encoded_name[i] = track_name.charCodeAt(i);
    }
    return new MIDIMetaEvent(MIDIMetaType.TRACK_NAME, encoded_name);
  }

  /**
   * Decode a binary meta message
   * @param {DataView} data_view Data view to read from
   * @param {number} offset Offset of the first byte after the 0xFF (i.e. the meta message type field)
   * @return {[MIDIMetaEvent | MIDITempoEvent, number]} (message, after_offset)
   */
  static decode(data_view, offset) {
    const meta_type = data_view.getUint8(offset);

    const [length, after] = decode_variable_length(data_view, offset + 1);
    const length_length = after - (offset + 1);

    const body = new Uint8Array(
      data_view.buffer,
      data_view.byteOffset + offset + 1 + length_length,
      length,
    );

    let message;
    if (meta_type === MIDIMetaType.SET_TEMPO) {
      message = MIDITempoEvent.from_payload(body);
    } else {
      message = new MIDIMetaEvent(meta_type, body);
    }

    const after_offset = offset + 1 + length_length + length;
    return [message, after_offset];
  }
}

MIDIMetaEvent.MAGIC = 0xff;
MIDIMetaEvent.END_OF_TRACK = Object.freeze(
  new MIDIMetaEvent(MIDIMetaType.END_OF_TRACK, new Uint8Array(0)),
);

/**
 * MIDI Set Tempo events are encoded in the unusual unit of
 * microseconds per quarter note, but packed in binary a particular
 * way. This class handles that conversion
 * @implements {MIDIEvent}
 */
export class MIDITempoEvent {
  /**
   * Constructor
   * @param {number} bpm Beats per minute
   */
  constructor(bpm) {
    this.bpm = bpm;
  }

  /**
   * @type {number[]}
   */
  get sort_key() {
    return [MIDIMetaEvent.MAGIC, MIDIMetaType.SET_TEMPO, this.bpm];
  }

  /**
   * @type {number}
   */
  get byte_length() {
    // 3 for the header + 3 for the 3-byte tempo
    return 6;
  }

  /**
   * Encode tempo message in an array
   * @param {DataView} data_view
   * @param {number} offset
   * @return {number} offset after writing
   */
  encode(data_view, offset) {
    const microsec_per_quarter = Math.round(
      MIDITempoEvent.MICROSEC_PER_MIN / this.bpm,
    );
    // the only data is the 3-byte tempo
    const length = 3;

    data_view.setUint8(offset + 0, MIDIMetaEvent.MAGIC);
    data_view.setUint8(offset + 1, MIDIMetaType.SET_TEMPO);
    data_view.setUint8(offset + 2, length);
    data_view.setUint8(offset + 3, (microsec_per_quarter >> 16) & 0xff);
    data_view.setUint8(offset + 4, (microsec_per_quarter >> 8) & 0xff);
    data_view.setUint8(offset + 5, microsec_per_quarter & 0xff);

    return offset + 6;
  }

  /**
   * Parse a 3-byte array as a MIDI tempo in big-endian microseconds per quarter note
   * @param {Uint8Array} payload A 3-byte payload containing the tempo value
   * @returns {MIDITempoEvent} The parsed event
   */
  static from_payload(payload) {
    const [t0, t1, t2] = payload;
    const microsec_per_quarter = (t0 << 16) | (t1 << 8) | t2;
    const MICROSEC_PER_MIN = 60e6;
    const bpm = (1 / microsec_per_quarter) * MICROSEC_PER_MIN;
    return new MIDITempoEvent(bpm);
  }
}
MIDITempoEvent.MICROSEC_PER_MIN = 60e6;

/**
 * @implements {MIDIEvent}
 */
export class MIDISysex {
  /**
   * Constructor
   * @param {Uint8Array} data Payload of the sysex message (not including the ending 0xF7 byte)
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
    // 0xF0 + length + payload length + 0xF7
    return 3 + this.data.length;
  }

  /**
   * Encode the message to binary
   * @param {DataView} data_view DataView to write to
   * @param {number} offset Starting offset
   * @return {number} New offset after writing
   */
  encode(data_view, offset) {
    data_view.setUint8(offset, MIDISysex.MAGIC);
    // +1 for the end of sysex byte
    data_view.setUint8(offset + 1, this.data.length + 1);
    offset += 2;

    for (const [i, x] of this.data.entries()) {
      data_view.setUint8(offset + i, x);
    }
    offset += this.data.length;

    data_view.setUint8(offset, MIDISysex.END_OF_SYSEX);
    offset++;

    return offset;
  }

  /**
   *
   * @param {DataView} data_view
   * @param {number} offset Offset of the first byte after the 0xf0, i.e. the length byte
   * @return {[MIDISysex, number]}
   */
  static decode(data_view, offset) {
    const [length, after] = decode_variable_length(data_view, offset);
    const length_length = after - offset;

    const data = new Uint8Array(
      data_view.buffer,
      data_view.byteOffset + offset + length_length,
      // length includes the end of sysex byte
      length - 1,
    );

    const message = new MIDISysex(data);
    const after_offset = after + length;
    return [message, after_offset];
  }
}
MIDISysex.MAGIC = 0xf0;
MIDISysex.END_OF_SYSEX = 0xf7;
