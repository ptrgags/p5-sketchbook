import {
  DATA_LENGTH,
  FORMAT_32_VOICES,
  ID_YAMAHA,
  NAME_LENGTH,
  OPERATOR_LENGTH,
  STATUS_END,
  STATUS_START,
  SUB_STATUS,
  TRAILER_OFFSET,
  VOICE_COUNT,
  VOICE_LENGTH,
  VOICE_START,
} from "./dx7_constants.js";
import { dx7_checksum } from "./dx7_checksum.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7LFO } from "./DX7LFO.js";
import { DX7KeyLevelScaling, DX7ScalingCurve } from "./DX7KeyLevelScaling.js";
import { DX7FreqSettings } from "./DX7FreqSettings.js";
import { DX7Voice } from "./DX7Voice.js";
import { DX7Cartridge } from "./DX7Cartridge.js";

/**
 * Decode an envelope
 * @param {Uint8Array} bytes arbitrary data view with envelope data
 * @param {number} offset Index where the envelope starts
 * @returns {DX7Envelope}
 */
function decode_envelope(bytes, offset) {
  const r1 = bytes[offset + 0];
  const r2 = bytes[offset + 1];
  const r3 = bytes[offset + 2];
  const r4 = bytes[offset + 3];
  const rates = [r1, r2, r3, r4];

  const l1 = bytes[offset + 4];
  const l2 = bytes[offset + 5];
  const l3 = bytes[offset + 6];
  const l4 = bytes[offset + 7];
  const levels = [l1, l2, l3, l4];

  return new DX7Envelope(rates, levels);
}

/**
 *
 * @param {Uint8Array} operator_bytes byte array restricted to operator
 * @param {number} num Operator number 1-6
 * @returns {DX7Operator}
 */
function decode_operator(operator_bytes, num) {
  const envelope = decode_envelope(operator_bytes, 0);
  // 39 = C3
  const breakpoint = operator_bytes[8];
  const left_depth = operator_bytes[9];
  const right_depth = operator_bytes[10];
  const scaling_curves = operator_bytes[11];
  const left_curve = scaling_curves & 0b11;
  const right_curve = (scaling_curves >> 2) & 0b11;

  const detune_rate_scale = operator_bytes[12];
  const key_rate_scaling = detune_rate_scale & 0b111;
  const detune = detune_rate_scale >> 3;

  const sensitivity = operator_bytes[13];
  const amp_mod_sensitivity = sensitivity & 0b11;
  const key_vel_sensitivity = sensitivity >> 2;

  const level = operator_bytes[14];

  const coarse_mode = operator_bytes[15];
  const osc_mode = coarse_mode & 0b1;
  const freq_coarse = coarse_mode >> 1;

  const freq_fine = operator_bytes[16];

  const left_scaling_curve = new DX7ScalingCurve(left_curve, left_depth);
  const right_scaling_curve = new DX7ScalingCurve(right_curve, right_depth);
  return new DX7Operator({
    num,
    envelope,
    level,
    amp_mod_sensitivity,
    key_vel_sensitivity,
    key_rate_scaling,
    freq: new DX7FreqSettings(osc_mode, detune, freq_coarse, freq_fine),
    key_level_scaling: new DX7KeyLevelScaling(
      breakpoint,
      left_scaling_curve,
      right_scaling_curve,
    ),
  });
}

/**
 *
 * @param {Uint8Array} voice_bytes
 * @param {number} offset
 * @returns {DX7LFO}
 */
function decode_lfo(voice_bytes, offset) {
  const speed = voice_bytes[offset + 0];
  const delay = voice_bytes[offset + 1];
  const pitch_mod_depth = voice_bytes[offset + 2];
  const amp_mod_depth = voice_bytes[offset + 3];

  const sensitivity_wave_sync = voice_bytes[offset + 4];
  const pitch_mod_sensitivity = sensitivity_wave_sync >> 5;
  const wave = (sensitivity_wave_sync >> 1) & 0b1111;
  const keyboard_sync = Boolean(sensitivity_wave_sync & 0b1);

  return new DX7LFO({
    speed,
    delay,
    pitch_mod_depth,
    amp_mod_depth,
    pitch_mod_sensitivity,
    wave,
    keyboard_sync,
  });
}

/**
 * Grab the 10 character name from the sysex dump
 * @param {Uint8Array} voice_view A DataView that starts at the beginning of the desired voice
 * @returns {string} The decoded name
 */
function decode_name(voice_view) {
  const NAME_START = 118;
  const name_chars = new Array(NAME_LENGTH);
  for (let i = 0; i < name_chars.length; i++) {
    const name_ord = voice_view[NAME_START + i];
    const name_str = String.fromCharCode(name_ord);
    name_chars[i] = name_str;
  }
  return name_chars.join("");
}

/**
 * Decode a single voice from part of a sysex dump
 * @param {Uint8Array} voice_bytes A Uint8Array restricted to the voice data
 * @returns {DX7Voice} The parsed patch
 */
function decode_voice(voice_bytes) {
  const operators = new Array(6);

  for (let i = 0; i < operators.length; i++) {
    const op_bytes = new Uint8Array(
      voice_bytes.buffer,
      voice_bytes.byteOffset + i * OPERATOR_LENGTH,
      OPERATOR_LENGTH,
    );
    operators[i] = decode_operator(op_bytes, 6 - i);
  }
  // the operators are listed in reverse order in the SYSEX file
  operators.reverse();

  const PITCH_ENV_START = 102;
  const pitch_env = decode_envelope(voice_bytes, PITCH_ENV_START);

  // algorithm is stored 0-31, but is displayed as 1-32
  const algorithm = voice_bytes[110];

  const sync_feedback = voice_bytes[111];
  const osc_key_sync = Boolean(sync_feedback >> 3);
  const feedback = sync_feedback & 0b111;

  const LFO_START = 112;
  const lfo = decode_lfo(voice_bytes, LFO_START);

  // transpose is stored as 0-48, but is a signed value -24 to 24
  const transpose = voice_bytes[117];

  const name = decode_name(voice_bytes);

  return new DX7Voice({
    name,
    algorithm,
    operators,
    pitch_env,
    lfo,
    osc_key_sync,
    feedback,
    transpose,
  });
}

/**
 * Decode a MIDI Sysex dump from a Yamaha DX7.
 *
 * @see {@link https://homepages.abdn.ac.uk/d.j.benson/pages/dx7/sysex-format.txt | DX7 Sysex Format article}
 * @param {ArrayBuffer} buffer
 * @returns {DX7Cartridge}
 */
export function decode_dx7(buffer) {
  const bytes = new Uint8Array(buffer);
  const status_byte = bytes[0];
  if (status_byte !== STATUS_START) {
    throw new Error(".syx file must start with 0xF0");
  }

  const id_num = bytes[1];
  if (id_num !== ID_YAMAHA) {
    throw new Error(`incorrect manufacturer id: ${id_num}`);
  }

  const sub_status = bytes[2];
  if (sub_status !== SUB_STATUS) {
    throw new Error("sub status must be 0");
  }

  const format_number = bytes[3];
  if (format_number !== FORMAT_32_VOICES) {
    throw new Error(`Only 32-voice DX7 .syx files are supported`);
  }

  const byte_count_msb = bytes[4];
  const byte_count_lsb = bytes[5];
  const byte_count = (byte_count_msb << 7) | byte_count_lsb;

  if (byte_count !== DATA_LENGTH) {
    throw new Error(`incorrect data length for 32 voices: ${byte_count}`);
  }

  const voices = new Array(VOICE_COUNT);
  for (let i = 0; i < VOICE_COUNT; i++) {
    const voice_bytes = new Uint8Array(
      buffer,
      VOICE_START + VOICE_LENGTH * i,
      VOICE_LENGTH,
    );
    const voice = decode_voice(voice_bytes);
    voices[i] = voice;
  }

  const checksum = bytes[TRAILER_OFFSET];

  const data_bytes = new Uint8Array(
    buffer,
    VOICE_START,
    VOICE_COUNT * VOICE_LENGTH,
  );
  const computed_checksum = dx7_checksum(data_bytes);

  if (computed_checksum !== checksum) {
    throw new Error("checksum invalid, data may be corrupted");
  }

  const end_status = bytes[TRAILER_OFFSET + 1];

  if (end_status !== STATUS_END) {
    throw new Error(`incorrect end byte, ${end_status}`);
  }

  // TODO: handle checksum, F7 end sysex byte

  return new DX7Cartridge(voices);
}
