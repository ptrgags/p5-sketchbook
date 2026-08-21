import { DX7Cartridge } from "../DX7PatchViewer/DX7Cartridge.js";
import { DX7Envelope } from "../DX7PatchViewer/DX7Envelope.js";
import { DX7KeyLevelScaling } from "../DX7PatchViewer/DX7KeyLevelScaling.js";
import { DX7LFO } from "../DX7PatchViewer/DX7LFO.js";
import { DX7Operator } from "../DX7PatchViewer/DX7Operator.js";
import { DX7Voice } from "../DX7PatchViewer/DX7Voice.js";
import {
  TOTAL_LENGTH,
  STATUS_START,
  ID_YAMAHA,
  SUB_STATUS,
  FORMAT_32_VOICES,
  DATA_LENGTH,
  VOICE_LENGTH,
  OPERATOR_LENGTH,
  NAME_LENGTH,
  VOICE_START,
  TRAILER_OFFSET,
  STATUS_END,
} from "../sketchlib/dx7/dx7_constants.js";

/**
 * Write an envelope (or pitch envelope) to the buffer
 * @param {DX7Envelope} envelope The envelope to encode
 * @param {Uint8Array} bytes
 * @param {number} offset Offset for the first byte of the envelope
 */
function encode_envelope(envelope, bytes, offset) {
  const [r1, r2, r3, r4] = envelope.rates;
  const [l1, l2, l3, l4] = envelope.levels;

  bytes[offset + 0] = r1;
  bytes[offset + 1] = r2;
  bytes[offset + 2] = r3;
  bytes[offset + 3] = r4;
  bytes[offset + 4] = l1;
  bytes[offset + 5] = l2;
  bytes[offset + 6] = l3;
  bytes[offset + 7] = l4;
}

/**
 * Encode the level scaling parameters
 * @param {DX7KeyLevelScaling} level_scaling
 * @param {Uint8Array} bytes
 * @param {number} offset
 */
function encode_level_scaling(level_scaling, bytes, offset) {
  bytes[offset] = level_scaling.breakpoint;
  bytes[offset + 1] = level_scaling.left_curve.depth;
  bytes[offset + 2] = level_scaling.right_curve.depth;
  bytes[offset + 3] =
    (level_scaling.right_curve.curve << 2) | level_scaling.left_curve.curve;
}

/**
 * Encode a single operator
 * @param {DX7Operator} operator
 * @param {Uint8Array} bytes
 * @param {number} offset
 */
function encode_operator(operator, bytes, offset) {
  // bytes 0-7
  encode_envelope(operator.envelope, bytes, offset + 0);
  // bytes 8-11
  encode_level_scaling(operator.key_level_scaling, bytes, offset + 8);

  bytes[offset + 12] = (operator.freq.detune << 3) | operator.key_rate_scaling;
  bytes[offset + 13] =
    (operator.key_vel_sensitivity << 2) | operator.amp_mod_sensitivity;
  bytes[offset + 14] = operator.level;
  bytes[offset + 15] = (operator.freq.coarse << 1) | operator.freq.mode;
  bytes[offset + 16] = operator.freq.fine;
}

/**
 * Encode the LFO settings
 * @param {DX7LFO} lfo
 * @param {Uint8Array} bytes
 * @param {number} offset
 */
function encode_lfo(lfo, bytes, offset) {
  bytes[offset + 0] = lfo.speed;
  bytes[offset + 1] = lfo.delay;
  bytes[offset + 2] = lfo.pitch_mod_depth;
  bytes[offset + 3] = lfo.amp_mod_depth;

  bytes[offset + 4] =
    (lfo.pitch_mod_sensitivity << 5) |
    (lfo.wave << 1) |
    Number(lfo.keyboard_sync);
}

/**
 * Encode a name as 10 ASCII bytes
 * @param {string} name
 * @param {Uint8Array} bytes
 * @param {number} offset
 */
function encode_name(name, bytes, offset) {
  for (let i = 0; i < NAME_LENGTH; i++) {
    bytes[offset + i] = name.charCodeAt(i);
  }
}

/**
 * Encode a single voice to the binary .syx file
 * @param {DX7Voice} voice The voice to write
 * @param {Uint8Array} bytes The array of bytes to write to
 * @param {number} offset Start offset for bytes
 */
function encode_voice(voice, bytes, offset) {
  for (const [i, operator] of voice.operators.entries()) {
    const operator_offset = offset + i * OPERATOR_LENGTH;
    encode_operator(operator, bytes, operator_offset);
  }

  const pitch_env_offset = offset + 102;
  encode_envelope(voice.pitch_env, bytes, pitch_env_offset);

  bytes[offset + 110] = voice.algorithm;

  const key_sync = Number(voice.osc_key_sync);
  bytes[offset + 111] = (key_sync << 3) | voice.feedback;

  encode_lfo(voice.lfo, bytes, offset + 112);

  bytes[offset + 117] = voice.transpose + 24;

  encode_name(voice.name, bytes, offset + 118);
}

/**
 *
 * @param {DX7Cartridge} cartridge
 * @returns {ArrayBuffer}
 */
export function encode_dx7(cartridge) {
  const bytes = new Uint8Array(TOTAL_LENGTH);
  bytes[0] = STATUS_START;
  bytes[1] = ID_YAMAHA;
  bytes[2] = SUB_STATUS;
  bytes[3] = FORMAT_32_VOICES;
  bytes[4] = DATA_LENGTH >> 7;
  bytes[5] = DATA_LENGTH & 0b111_1111;

  for (const [i, voice] of cartridge.voices.entries()) {
    encode_voice(voice, bytes, VOICE_START + i * VOICE_LENGTH);
  }

  let checksum = 0;
  for (let i = VOICE_START; i < TRAILER_OFFSET; i++) {
    checksum += bytes[i];
  }

  bytes[TRAILER_OFFSET] = checksum & 0b1111111;
  bytes[TRAILER_OFFSET + 1] = STATUS_END;

  return bytes.buffer;
}

/**
 *
 * @param {DX7Cartridge} cartridge
 * @param {string} filename
 * @returns {File}
 */
export function encode_dx7_file(cartridge, filename) {
  if (!filename.endsWith(".syx")) {
    throw new Error("filename must end with .syx");
  }

  // TODO: What MIME type?
  return new File([encode_dx7(cartridge)], filename);
}
