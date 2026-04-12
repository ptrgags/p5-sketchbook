import { describe, it, expect } from "vitest";
import {
  BITS_PER_SAMPLE,
  BYTES_PER_SAMPLE,
  BYTES_PER_SECOND,
  CHANNELS_MONO,
  encode_wav,
  SAMPLE_RATE,
} from "./encode_wav.js";

const RIFF_HEADER = [
  "R".charCodeAt(0),
  "I".charCodeAt(0),
  "F".charCodeAt(0),
  "F".charCodeAt(0),
];

const WAVE_HEADER = [
  "W".charCodeAt(0),
  "A".charCodeAt(0),
  "V".charCodeAt(0),
  "E".charCodeAt(0),
];

const FMT_HEADER = [
  "f".charCodeAt(0),
  "m".charCodeAt(0),
  "t".charCodeAt(0),
  " ".charCodeAt(0),
];

const DATA_HEADER = [
  "d".charCodeAt(0),
  "a".charCodeAt(0),
  "t".charCodeAt(0),
  "a".charCodeAt(0),
];

describe("encode_wav", () => {
  it("with no samples generates empty wav file", () => {
    const samples = new Float32Array();

    const result = new Uint8Array(encode_wav(samples));

    const expected = new Uint8Array([
      ...RIFF_HEADER,
      // data length - 8 bytes
      // the header is always 44 bytes, -8 gives 36
      36,
      0,
      0,
      0,
      ...WAVE_HEADER,
      ...FMT_HEADER,
      // fmt chunk size = 16
      16,
      0,
      0,
      0,
      // audio format 1 = PCM
      1,
      0,
      // number of channels = 1 (mono)
      CHANNELS_MONO,
      0,
      // sample rate 44100 = 172 * 256 + 68
      68,
      172,
      0,
      0,
      // bytes per second 88200 = 1 * 256^2 + 88 * 256 + 136
      136,
      88,
      1,
      0,
      // bytes per sample
      BYTES_PER_SAMPLE,
      0,
      // bits per sample
      BITS_PER_SAMPLE,
      0,
      ...DATA_HEADER,
      // data length = 0 bytes
      0,
      0,
      0,
      0,
    ]);
    expect(result).toEqual(expected);
  });

  it("with samples generates valid wav file", () => {
    // 4 samples is 44100/4 = 11025 Hz tone exactly
    const samples = new Float32Array([1, 1, -1, -1]);

    const result = new Uint8Array(encode_wav(samples));

    const expected = new Uint8Array([
      ...RIFF_HEADER,
      // data length - 8 bytes
      // the header is always 44 bytes, + 8 bytes for the data, -8 bytes = 44
      44,
      0,
      0,
      0,
      ...WAVE_HEADER,
      ...FMT_HEADER,
      // fmt chunk size = 16
      16,
      0,
      0,
      0,
      // audio format 1 = PCM
      1,
      0,
      // number of channels = 1 (mono)
      CHANNELS_MONO,
      0,
      // sample rate 44100 = 172 * 256 + 68
      68,
      172,
      0,
      0,
      // bytes per second 88200 = 1 * 256^2 + 88 * 256 + 136
      136,
      88,
      1,
      0,
      // bytes per sample
      BYTES_PER_SAMPLE,
      0,
      // bits per sample
      BITS_PER_SAMPLE,
      0,
      ...DATA_HEADER,
      // data length = 8 bytes
      8,
      0,
      0,
      0,
      // data itself (4 samples, 2 bytes each)
      // 1 gets mapped to the max value of
      // 0b01111111 1111111 = 0x7F FF
      // but written in little endian as FF 7F
      0xff,
      0x7f,
      0xff,
      0x7f,
      // -1 is mapped to the smallest value
      // 010000000 0000000 = 0x80 0x00
      // in little endian this is 00 80
      0x00,
      0x80,
      0x00,
      0x80,
    ]);
    expect(result).toEqual(expected);
  });
});
