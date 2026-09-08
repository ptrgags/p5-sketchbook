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
import {
  DX7KeyLevelScaling,
  DX7ScalingCurve,
  DX7ScalingCurveType,
} from "./DX7KeyLevelScaling.js";
import { dx7_checksum } from "./dx7_checksum.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7Voice } from "./DX7Voice.js";
import { DX7LFO, DX7LFOType } from "./DX7LFO.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7FreqMode, DX7FreqSettings } from "./DX7FreqSettings.js";

const HEADER = [
  STATUS_START,
  ID_YAMAHA,
  SUB_STATUS,
  FORMAT_32_VOICES,
  DATA_LENGTH >> 7,
  DATA_LENGTH & 0b1111111,
];

const DEFAULT_ENVELOPE_BYTES = [
  // rates
  99, 99, 99, 99,
  // levels
  99, 99, 99, 0,
];
// nontrivial envelope
const PLUCK_ENV_BYTES = [
  // rates
  99, 99, 25, 25,
  // levels
  99, 99, 0, 0,
];

const PLUCK_ENVELOPE = new DX7Envelope([99, 99, 25, 25], [99, 99, 0, 0]);

const DEFAULT_PITCH_ENV_BYTES = [
  // rates
  99, 99, 99, 99,
  // levels
  50, 50, 50, 50,
];
// non-trivial pitch envelope
const PITCH_SWELL_BYTES = [
  // rates
  50, 99, 50, 50,
  // levels
  99, 99, 50, 50,
];
const PITCH_SWELL_ENVELOPE = new DX7Envelope(
  // rates
  [50, 99, 50, 50],
  // levels
  [99, 99, 50, 50],
);

const DEFAULT_SCALING_BYTES = [0, 0, 0, 0];
const SCALING_INCREASE_BYTES = [
  // breakpoint note
  50,
  // left depth
  99,
  // right depth
  50,
  // right curve | left curve
  (DX7ScalingCurveType.NEG_LIN << 2) | DX7ScalingCurveType.POS_EXP,
];

const SCALING_INCREASE = new DX7KeyLevelScaling(
  50,
  new DX7ScalingCurve(DX7ScalingCurveType.POS_EXP, 99),
  new DX7ScalingCurve(DX7ScalingCurveType.NEG_LIN, 50),
);

const DEFAULT_OPERATOR_BYTES = [
  // 8 bytes
  ...DEFAULT_ENVELOPE_BYTES,
  // 4 bytes
  ...DEFAULT_SCALING_BYTES,
  // detune = 0 (stored as 7), key_rate_scaling = 0
  7 << 3,
  // key vel sensitivity = 0, amp mod sensitivity = 0
  0,
  // level = 99
  99,
  // coarse = 1, mode = ratio = 0
  1 << 1,
  // fine = 0
  0,
];
const DEFAULT_SILENT_OPERATOR_BYTES = [
  ...DEFAULT_ENVELOPE_BYTES,
  ...DEFAULT_SCALING_BYTES,
  // detune = 0 (stored as 7), key_rate_scaling = 0
  7 << 3,
  // key vel sensitivity = 0, amp mod sensitivity = 0
  0,
  // level = 0
  0,
  // coarse = 1, mode = ratio = 0
  1 << 1,
  // fine = 0
  0,
];
const NONTRIVIAL_OPERATOR_BYTES = [
  ...PLUCK_ENV_BYTES,
  ...SCALING_INCREASE_BYTES,
  // detune = +7 (stored as 14), key_rate_scaling = 3
  (14 << 3) | 3,
  // key vel sensitivity = 2, amp mod sensitivity = 3
  (2 << 2) | 3,
  // level
  75,
  // coarse = 0.5x (stored as 0), mode = ratio = 0
  0,
  // fine = 25
  25,
];
// these will be renumbered when used
const DEFAULT_OPERATOR = DX7Operator.init(1, 99);
const DEFAULT_SILENT_OPERATOR = DX7Operator.init(1, 0);
const NONTRIVIAL_OPERATOR = new DX7Operator({
  num: 1,
  envelope: PLUCK_ENVELOPE,
  level: 75,
  freq: new DX7FreqSettings(DX7FreqMode.RATIO, 14, 0, 25),
  amp_mod_sensitivity: 3,
  key_vel_sensitivity: 2,
  key_rate_scaling: 3,
  key_level_scaling: SCALING_INCREASE,
});

const DEFAULT_LFO_BYTES = [
  // speed
  35,
  // delay
  0,
  // pitch mod depth
  0,
  // amp mod depth
  0,
  // mod sensititvity = 3, wave = TRI = 0, key sync = true
  (3 << 5) | 1,
];

const SAW_LFO_BYTES = [
  // speed
  60,
  // delay = 10
  10,
  // pitch mod depth = 50
  50,
  // amp mod depth = 75
  75,
  // mod sensitivity = 4, wave = saw down = 1, key sync = true
  (4 << 5) | (1 << 1) | 1,
];

const SAW_LFO = new DX7LFO({
  speed: 60,
  delay: 10,
  pitch_mod_depth: 50,
  amp_mod_depth: 75,
  pitch_mod_sensitivity: 4,
  wave: DX7LFOType.SAW_DOWN,
  keyboard_sync: true,
});

const DEFAULT_NAME = ["-", "-", "I", "N", "I", "T", "-", "-", " ", " "].map(
  (x) => x.charCodeAt(0),
);

/**
 * @type {number[]}
 */
const INIT_VOICE_BYTES = [
  // NOTE: in the sysex file the operators are listed in reverse order
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_OPERATOR_BYTES,
  // Pitch envelope
  ...DEFAULT_PITCH_ENV_BYTES,
  // algorithm 1 (stored as 0)
  0,
  // key sync = true, feedback 0
  1 << 3,
  ...DEFAULT_LFO_BYTES,
  // transpose 0 semitones, this is stored as 0 + 24 = 24
  24,
  ...DEFAULT_NAME,
];

const NONTRIVIAL_NAME = ["N", "O", "N", "T", "R", "I", "V", "I", "A", "L"].map(
  (x) => x.charCodeAt(0),
);

const NONTRIVIAL_VOICE_BYTES = [
  // again, operators are listed in reverse order
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...DEFAULT_OPERATOR_BYTES,
  ...NONTRIVIAL_OPERATOR_BYTES,
  ...DEFAULT_SILENT_OPERATOR_BYTES,
  ...NONTRIVIAL_OPERATOR_BYTES,
  // pitch env
  ...PITCH_SWELL_BYTES,
  // algorithm 32 (stored as 31)
  31,
  // key sync = 1, feedback = 7
  (1 << 3) | 7,
  ...SAW_LFO_BYTES,
  // transpose +12 semitones, this is stored as 12 + 24 = 36
  36,
  ...NONTRIVIAL_NAME,
];

const NONTRIVIAL_VOICE = new DX7Voice({
  name: "NONTRIVIAL",
  algorithm: 31,
  feedback: 7,
  operators: [
    NONTRIVIAL_OPERATOR.renumber(1),
    DEFAULT_SILENT_OPERATOR.renumber(2),
    NONTRIVIAL_OPERATOR.renumber(3),
    DEFAULT_OPERATOR.renumber(4),
    DEFAULT_SILENT_OPERATOR.renumber(5),
    DEFAULT_SILENT_OPERATOR.renumber(6),
  ],
  pitch_env: PITCH_SWELL_ENVELOPE,
  lfo: SAW_LFO,
  transpose: 36,
  osc_key_sync: true,
});

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
    data.push(...INIT_VOICE_BYTES);
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
    const bad_checksum = make_cartridge_bytes().slice();
    bad_checksum[bad_checksum.length - 2] = 42;

    expect(() => {
      return decode_dx7(bad_checksum.buffer);
    }).toThrowError("checksum invalid");
  });

  it("with init cartridge parses correctly", () => {
    const cartridge = make_cartridge_bytes().slice();

    const result = decode_dx7(cartridge.buffer);

    const expected = new DX7Cartridge([]);
    expect(result).toEqual(expected);
  });

  it("with nontrivial voice parses correctly", () => {
    const voice = make_cartridge_bytes(NONTRIVIAL_VOICE_BYTES).slice();

    const result = decode_dx7(voice.buffer);

    const expected = new DX7Cartridge([NONTRIVIAL_VOICE]);
    expect(result).toEqual(expected);
  });
});

describe("encode_dx7", () => {
  it("with init cartridge encodes correctly", () => {
    const cartridge = new DX7Cartridge([]);

    const result = new Uint8Array(encode_dx7(cartridge));

    const expected = make_cartridge_bytes();
    expect(result).toEqual(expected);
  });

  it("with nontrivial voice encodes correctly", () => {
    const cartridge = new DX7Cartridge([NONTRIVIAL_VOICE]);

    const result = new Uint8Array(encode_dx7(cartridge));

    const expected = make_cartridge_bytes(NONTRIVIAL_VOICE_BYTES);
    expect(result).toEqual(expected);
  });
});

describe("dx7 integration", () => {
  it("encode then decode is identity", () => {
    const cartridge = new DX7Cartridge([]);

    const result = decode_dx7(encode_dx7(cartridge));

    expect(result).toEqual(cartridge);
  });

  it("decode then encode is identity", () => {
    const bytes = make_cartridge_bytes(NONTRIVIAL_VOICE_BYTES).slice();

    const result = encode_dx7(decode_dx7(bytes.buffer));
    const bytes_array = new Uint8Array(bytes);
    const result_array = new Uint8Array(result);

    expect(result_array).toEqual(bytes_array);
  });
});
