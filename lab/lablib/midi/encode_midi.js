import { MIDIFile, MIDIHeader, RelativeTimingTrack } from "./MidiFile.js";

/**
 * Compute the byte length of the encoded MIDI file up front before
 * allocating the buffer
 * @param {MIDIFile} midi The MIDI file
 */
function compute_length(midi) {
  return 0;
}

/**
 * Encode the MIDI header to binary
 * @param {DataView} data_view The data view to write to
 * @param {number} offset The offset of the first byte to write
 * @param {MIDIHeader} header The header to write
 * @returns {number} New offset after the end of the header
 */
function encode_header(data_view, offset, header) {
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
