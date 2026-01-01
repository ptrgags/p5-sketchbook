import { MIDIFile, MIDIHeader } from "./MIDIFile.js";
import { RelativeTimingTrack } from "./MIDITrack.js";

/**
 * Decode a MIDIFile from binary data
 * @param {ArrayBuffer} midi_buffer
 * @return {MIDIFile}
 */
export function decode_midi(midi_buffer) {
  const header = MIDIHeader.DEFAULT_FORMAT0;
  const track = new RelativeTimingTrack([]);
  return new MIDIFile(header, [track]);
}
