import { MIDIFile, MIDIHeader, RelativeTimingTrack } from "./MidiFile.js";
import { compute_variable_length } from "./variable_length.js";

export const HEADER_MAGIC = [
  "M".charCodeAt(0),
  "T".charCodeAt(0),
  "h".charCodeAt(0),
  "d".charCodeAt(0),
];
export const TRACK_MAGIC = [
  "M".charCodeAt(0),
  "t".charCodeAt(0),
  "h".charCodeAt(0),
  "d".charCodeAt(0),
];

export const END_OF_TRACK = [0xff, 0x2f, 0x00];

const SIZE_U32 = 4;
const BIG_ENDIAN = false;

/**
 * Get the length of all the messages in the track. This does not include
 * the end of track or the header
 * @param {RelativeTimingTrack} track The track
 * @returns {number} The length of the messages in this track
 */
function compute_messages_length(track) {
  let total = 0;
  for (const [t, message] of track.events) {
    total += compute_variable_length(t);
    total += message.byte_length;
  }
  return total;
}

/**
 * Compute the byte length of the encoded MIDI file up front before
 * allocating the buffer
 * @param {MIDIFile} midi The MIDI file
 */
function compute_length(midi) {
  const header_length =
    HEADER_MAGIC.length + SIZE_U32 + MIDIHeader.CHUNK_LENGTH;

  let total_track_length = 0;
  for (const track of midi.tracks) {
    const message_length = compute_messages_length(track);
    const track_length =
      TRACK_MAGIC.length + SIZE_U32 + message_length + END_OF_TRACK.length;
    total_track_length += track_length;
  }

  return header_length + total_track_length;
}

/**
 * Encode the MIDI header to binary
 * @param {DataView} data_view The data view to write to
 * @param {number} offset The offset of the first byte to write
 * @param {MIDIHeader} header The header to write
 * @returns {number} New offset after the end of the header
 */
function encode_header(data_view, offset, header) {
  // write Mthd in ASCII
  for (let i = 0; i < HEADER_MAGIC.length; i++) {
    data_view.setUint8(offset + i, HEADER_MAGIC[i]);
  }
  offset += HEADER_MAGIC.length;

  data_view.setUint32(offset, MIDIHeader.CHUNK_LENGTH, BIG_ENDIAN);
  offset += SIZE_U32;

  data_view.setUint8(offset + 1, header.format);
  data_view.setUint8(offset + 2, header.num_tracks);
  data_view.setUint8(offset + 3, header.ticks_per_quarter);
  offset += MIDIHeader.CHUNK_LENGTH;

  return offset;
}

/**
 * Encode a MIDI track to binary
 * @param {DataView} data_view The data view in which to write the track
 * @param {number} offset The start offset to write the track
 * @param {RelativeTimingTrack} track MIDI track. it MUST have relative times as per the MIDI spec
 * @return {number} New offset after the end of the track
 */
function encode_track(data_view, offset, track) {
  return offset;
}

/**
 *
 * @param {MIDIFile} midi The MIDI file to encode
 * @returns {ArrayBuffer} Binary MIDI data to put in a
 */
export function encode_midi(midi) {
  if (midi.tracks.length === 0) {
    throw new Error("MIDI files must have at least one track");
  }

  const length = compute_length(midi);

  const buffer = new ArrayBuffer(length);
  const data_view = new DataView(buffer);

  let offset = 0;
  offset = encode_header(data_view, offset, midi.header);
  for (const track of midi.tracks) {
    offset = encode_track(data_view, offset, track);
  }

  return buffer;
}

/**
 * Encode MIDI to a File object, e.g. to be downloaded
 * @param {MIDIFile} midi The MIDI data to encode as binary
 * @param {string} filename Filename that must end in .mid
 * @returns {File} A file for downloading
 */
export function encode_midi_file(midi, filename) {
  if (!filename.endsWith(".mid")) {
    throw new Error("filename must end with .mid");
  }

  return new File([encode_midi(midi)], filename, {
    type: "audio/mid",
  });
}
