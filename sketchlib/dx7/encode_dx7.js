import { DX7Cartridge } from "./DX7Cartridge.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7KeyLevelScaling } from "./DX7KeyLevelScaling.js";
import { DX7LFO } from "./DX7LFO.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7Voice } from "./DX7Voice.js";
import { dx7_checksum } from "./dx7_checksum.js";
import { NAME_LENGTH, STATUS_END, HEADER_BYTES } from "./dx7_constants.js";

/**
 * Write an envelope (or pitch envelope) to the buffer
 * @param {DX7Envelope} envelope The envelope to encode
 * @returns {number[]}
 */
function pack_envelope(envelope) {
  return [...envelope.rates, ...envelope.levels];
}

/**
 * Encode the level scaling parameters
 * @param {DX7KeyLevelScaling} level_scaling
 * @returns {number[]}
 */
function pack_level_scaling(level_scaling) {
  return [
    level_scaling.breakpoint,
    level_scaling.left_curve.depth,
    level_scaling.right_curve.depth,
    (level_scaling.right_curve.curve << 2) | level_scaling.left_curve.curve,
  ];
}

/**
 * Encode a single operator
 * @param {DX7Operator} operator
 * @return {number[]}
 */
function pack_operator(operator) {
  return [
    ...pack_envelope(operator.envelope),
    ...pack_level_scaling(operator.key_level_scaling),
    (operator.freq.detune << 3) | operator.key_rate_scaling,
    (operator.key_vel_sensitivity << 2) | operator.amp_mod_sensitivity,
    operator.level,
    (operator.freq.coarse << 1) | operator.freq.mode,
    operator.freq.fine,
  ];
}

/**
 * Encode the LFO settings
 * @param {DX7LFO} lfo
 * @return {number[]}
 */
function pack_lfo(lfo) {
  return [
    lfo.speed,
    lfo.delay,
    lfo.pitch_mod_depth,
    lfo.amp_mod_depth,
    (lfo.pitch_mod_sensitivity << 5) |
      (lfo.wave << 1) |
      Number(lfo.keyboard_sync),
  ];
}

/**
 * Encode a name as 10 ASCII bytes
 * @param {string} name
 * @return {number[]}
 */
function pack_name(name) {
  const result = new Array(NAME_LENGTH);
  for (let i = 0; i < NAME_LENGTH; i++) {
    result[i] = name.charCodeAt(i);
  }
  return result;
}

/**
 * Encode a single voice to the binary .syx file
 * @param {DX7Voice} voice The voice to write
 * @returns {number[]}
 */
function pack_voice(voice) {
  const packed_operators = voice.operators.map(pack_operator);
  // For whatever reason, the operators are stored in reverse order in the
  // sysex dump
  packed_operators.reverse();

  const key_sync = Number(voice.osc_key_sync);

  return [
    ...packed_operators.flat(),
    ...pack_envelope(voice.pitch_env),
    voice.algorithm,
    (key_sync << 3) | voice.feedback,
    ...pack_lfo(voice.lfo),
    voice.transpose,
    ...pack_name(voice.name),
  ];
}

/**
 *
 * @param {DX7Cartridge} cartridge
 * @returns {ArrayBuffer}
 */
export function encode_dx7(cartridge) {
  const voice_bytes = cartridge.voices.map(pack_voice).flat();

  const checksum = dx7_checksum(new Uint8Array(voice_bytes));
  const trailer = [checksum, STATUS_END];

  const bytes = new Uint8Array([...HEADER_BYTES, ...voice_bytes, ...trailer]);
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
  return new File([encode_dx7(cartridge)], filename, {
    type: "application/octet-stream",
  });
}
