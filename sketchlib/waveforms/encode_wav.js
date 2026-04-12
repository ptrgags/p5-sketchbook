import { write_ascii } from "../binary/write_ascii.js";
import { Tween } from "../Tween.js";

// WAV uses little-endian, see https://en.wikipedia.org/wiki/WAV#WAV_file_header
const LITTLE_ENDIAN = true;

export const CHANNELS_MONO = 1;

const HEADER_SIZE = 44;

export const SAMPLE_RATE = 44100;

// 16-bit (CD-quality) audio
export const BYTES_PER_SAMPLE = 2;
export const BITS_PER_SAMPLE = 8 * BYTES_PER_SAMPLE;
export const BYTES_PER_SECOND = SAMPLE_RATE * BYTES_PER_SAMPLE;

// max value is 0b01111111 11111111 = 2^15 - 1
const MAX_VALUE_I16 = (1 << 15) - 1;
// min value is 0b10000000 00000000 = -2^15
const MIN_VALUE_I16 = -(2 ** 15);

// we want to mape [-1, 1] to [MIN, MAX].
const TWEEN_TO_I16 = Tween.scalar(MIN_VALUE_I16, MAX_VALUE_I16, -1, 2);

/**
 * Convert a sample value to a signed 16-bit integer
 * @param {number} sample The sample value in [-1, 1]
 * @returns an integer in the range of an i16
 */
function to_i16(sample) {
  const interpolated = TWEEN_TO_I16.get_value(sample);
  return Math.round(interpolated);
}

// if we let L = 2^15, we want to
// map [-1, 1] to [-L, L - 1]
// t = unlerp(-1, 1, x)
// (1 - t)a + tb = y
// a + t(b - a) = y
// (y - a)/(b-a)
// value = lerp(-L, L - 1, t)

/**
 * Encode a WAV file. I'm only generating mono waveforms
 *
 * This is loosely following https://devtails.xyz/@adam/how-to-write-a-wav-file-in-javascript
 * @param {Float32Array} samples Audio samples
 * @returns {ArrayBuffer}
 */
export function encode_wav(samples) {
  const data_length = BYTES_PER_SAMPLE * samples.length;
  const byte_length = HEADER_SIZE + data_length;
  const buffer = new ArrayBuffer(byte_length);
  const data_view = new DataView(buffer);

  // RIFF header ----------------------------
  let offset = write_ascii(data_view, "RIFF", 0);

  // file size minus 8 bytes for the RIFF header
  data_view.setUint32(offset, byte_length - 8, LITTLE_ENDIAN);
  offset += 4;

  // WAVE header ---------------------------------
  offset = write_ascii(data_view, "WAVE", offset);

  // "fmt " magic number
  offset = write_ascii(data_view, "fmt ", offset);

  // chunk size minus the 8-byte header = 16 bytes
  data_view.setUint32(offset, 16, LITTLE_ENDIAN);
  offset += 4;

  // format 1: PCM integer
  // huh interesting, 2 would be float values...
  data_view.setUint16(offset, 1, LITTLE_ENDIAN);
  offset += 2;

  // number of channels. 1 for mono
  data_view.setUint16(offset, CHANNELS_MONO, LITTLE_ENDIAN);
  offset += 2;

  // sample rate in cycles/second
  data_view.setUint32(offset, SAMPLE_RATE, LITTLE_ENDIAN);
  offset += 4;

  // bytes to read per second
  data_view.setUint32(offset, SAMPLE_RATE * BYTES_PER_SAMPLE, LITTLE_ENDIAN);
  offset += 4;

  // bytes per block = number of channels * bytes per sample
  data_view.setUint16(offset, CHANNELS_MONO * BYTES_PER_SAMPLE, LITTLE_ENDIAN);
  offset += 2;

  // 16 bits per sample
  data_view.setUint16(offset, BYTES_PER_SAMPLE * 8, LITTLE_ENDIAN);
  offset += 2;

  // "data" magic number
  offset = write_ascii(data_view, "data", offset);

  data_view.setUint32(offset, data_length, LITTLE_ENDIAN);
  offset += 4;

  for (const [i, value] of samples.entries()) {
    data_view.setInt16(
      offset + BYTES_PER_SAMPLE * i,
      to_i16(value),
      LITTLE_ENDIAN,
    );
  }
  offset += BYTES_PER_SAMPLE * samples.length;

  if (offset !== byte_length) {
    console.log("actual", offset, "expected", byte_length);
    throw new Error("whoops, my offsets are off");
  }

  return buffer;
}

/**
 * Encode a WAV file to a File object e.g. to be downloaded
 * @param {Float32Array} samples Array of samples (in the range [-1, 1])
 * @param {string} filename Filename that must end with .wave
 * @returns {File} A file suitable for downloading
 */
export function encode_wav_file(samples, filename) {
  if (!filename.endsWith(".wav")) {
    throw new Error("filename must end with .wav");
  }

  return new File([encode_wav(samples)], filename, { type: "audio/wav" });
}
