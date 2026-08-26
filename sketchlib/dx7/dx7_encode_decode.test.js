import { describe, it, expect } from "vitest";
import { DX7Cartridge } from "./DX7Cartridge.js";
import { decode_dx7 } from "./decode_dx7.js";
import { encode_dx7 } from "./encode_dx7.js";
import {
  DATA_LENGTH,
  FORMAT_32_VOICES,
  ID_YAMAHA,
  STATUS_END,
  STATUS_START,
  SUB_STATUS,
  VOICE_COUNT,
} from "./dx7_constants.js";
import { DX7ScalingCurveType } from "./DX7KeyLevelScaling.js";
import { dx7_checksum } from "./dx7_checksum.js";

const HEADER = [
  STATUS_START,
  ID_YAMAHA,
  SUB_STATUS,
  FORMAT_32_VOICES,
  DATA_LENGTH >> 7,
  DATA_LENGTH & 0b1111111,
];

const DEFAULT_ENVELOPE = [
  // rates
  99, 99, 99, 99,
  // levels
  99, 99, 99, 0,
];
// non-trivial envelope
const PLUCK_ENV = [
  // rates
  99, 99, 25, 25,
  // levels
  99, 99, 0, 0,
];

const DEFAULT_PITCH_ENV = [
  // rates
  99, 99, 99, 99,
  // levels
  50, 50, 50, 50,
];
// non-trivial pitch envelope
const PITCH_SWELL = [
  // rates
  50, 99, 50, 50,
  // levels
  99, 99, 50, 50,
];

const DEFAULT_SCALING = [0, 0, 0, 0, 0];
const SCALING_INCREASE = [
  // breakpoint note
  50,
  //
  99,
  50,
  // right curve | left curve
  (DX7ScalingCurveType.NEG_LIN << 2) | DX7ScalingCurveType.POS_EXP,
];

const DEFAULT_OPERATOR = [
  ...DEFAULT_ENVELOPE,
  ...DEFAULT_SCALING,
  // detune = 0, key_rate_scaling = 0
  0,
  // key vel sensitivity = 0, amp mod sensitivity = 0
  0,
  // 0 level
  0,
  // coarse = 1, mode = ratio = 0
  1 << 1,
  // fine = 0
  0,
];
const DEFAULT_SILENT_OPERATOR = [
  ...DEFAULT_ENVELOPE,
  ...DEFAULT_SCALING,
  // detune = 0, key_rate_scaling = 0
  0,
  // key vel sensitivity = 0, amp mod sensitivity = 0
  0,
  // 0 level
  0,
  // coarse = 1, mode = ratio = 0
  1 << 1,
  // fine = 0
  0,
];
const NON_TRIVIAL_OPERATOR = [
  ...PLUCK_ENV,
  ...SCALING_INCREASE,
  // detune = +7 (stored as 14), key_rate_scaling = 3
  14 << 3 || 3,
  // key vel sensitivity = 2, amp mod sensitivity = 3
  (2 << 2) | 3,
  // level
  75,
  // coarse = 0.5x (stored as 0), mode = ratio = 0
  0,
  // fine = 25
  25,
];

const DEFAULT_LFO = [
  // speed
  35,
  // delay
  0,
  // pitch mod depth
  0,
  // amp mod depth
  0,
  // mod sensititvity = 0, wave = TRI = 0, key sync = 0
  0,
];

const SAW_LFO = [
  // speed
  60,
  // delay = 10
  10,
  // pitch mod depth = 50
  50,
  // amp mod depth = 75
  75,
  // mod sensitivity = 4, wave = saw down = 1, key sync = 1
  (4 << 5) | (1 << 1) | 1,
];

const DEFAULT_NAME = ["-", "-", "I", "N", "I", "T", "-", "-", " ", " "].map(
  (x) => x.charCodeAt(0),
);

/**
 * @type {number[]}
 */
const INIT_VOICE = [
  ...DEFAULT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...DEFAULT_PITCH_ENV,
  // algorithm 1 (stored as 0)
  0,
  // key sync 0, feedback 0
  0,
  ...DEFAULT_LFO,
  ...DEFAULT_NAME,
];

const NONTRIVIAL_NAME = ["N", "O", "N", "T", "R", "I", "V", "I", "A", "L"].map(
  (x) => x.charCodeAt(0),
);

const NONTRIVIAL_VOICE = [
  ...NON_TRIVIAL_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...NON_TRIVIAL_OPERATOR,
  ...DEFAULT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  ...DEFAULT_SILENT_OPERATOR,
  // algorithm 32 (stored as 31)
  31,
  // key sync = 1, feedback = 7
  (1 << 3) | 7,
  ...SAW_LFO,
  ...NONTRIVIAL_NAME,
];

/**
 * Combine cartridge parts into a
 * @param {number[][]} voices Voices to add to the list
 * @returns {Uint8Array}
 */
function make_cartridge_bytes(...voices) {
  const bytes = [...HEADER];

  const data = voices.flat();

  const remaining_voices = VOICE_COUNT - voices.length;
  for (let i = 0; i < remaining_voices; i++) {
    data.push(...INIT_VOICE);
  }

  const checksum = dx7_checksum(new Uint8Array(data));

  bytes.push(...data, checksum, STATUS_END);
  return new Uint8Array(bytes);
}

describe("decode_dx7", () => {
  it("with empty bytes throws error", () => {
    expect(() => {
      return decode_dx7(new ArrayBuffer(0));
    }).toThrowError(".syx file must start with 0xF0");
  });

  it("with bad manufacturer id throws error", () => {
    const bad_id = new Uint8Array([STATUS_START, 42]);

    expect(() => {
      return decode_dx7(bad_id.buffer);
    }).toThrowError("incorrect manufacturer id: 42");
  });

  it("with bad sub-status throws error", () => {
    const bad_sub = new Uint8Array([STATUS_START, ID_YAMAHA, 84]);

    expect(() => {
      return decode_dx7(bad_sub.buffer);
    }).toThrowError("sub status must be 0");
  });

  it("with format other than 32 voices throws error", () => {
    const bad_format = new Uint8Array([STATUS_START, ID_YAMAHA, SUB_STATUS, 0]);

    expect(() => {
      return decode_dx7(bad_format.buffer);
    }).toThrowError("Only 32-voice DX7 .syx files are supported");
  });

  it("with incorrect length for 32 voices throws error", () => {
    const bad_length = new Uint8Array([
      STATUS_START,
      ID_YAMAHA,
      SUB_STATUS,
      FORMAT_32_VOICES,
      // 155 bytes, that would be for a 1-voice message
      0x01,
      0x1b,
    ]);

    expect(() => {
      return decode_dx7(bad_length.buffer);
    }).toThrowError("incorrect data length for 32 voices: 155");
  });

  it("with bad checksum throws error", () => {
    const bad_checksum = make_cartridge_bytes([]).slice();
    bad_checksum[bad_checksum.length - 2] = 42;

    expect(() => {
      return decode_dx7(bad_checksum.buffer);
    }).toThrowError("balkwjdfkljasd");
  });
});

describe("encode_dx7", () => {});

describe("dx7 integration", () => {
  it("encode then decode is identity", () => {
    const cartridge = new DX7Cartridge([]);

    const result = decode_dx7(encode_dx7(cartridge));

    expect(result).toEqual(cartridge);
  });

  it("decode then encode is identity", () => {
    const bytes = make_cartridge_bytes(NONTRIVIAL_VOICE).slice();

    const result = encode_dx7(decode_dx7(bytes.buffer));
    const bytes_array = new Uint8Array(bytes);
    const result_array = new Uint8Array(result);

    expect(result_array).toEqual(bytes_array);
  });
});
