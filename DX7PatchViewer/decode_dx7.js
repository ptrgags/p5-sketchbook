import {
  DATA_LENGTH,
  FORMAT_32_VOICES,
  ID_YAMAHA,
  NAME_LENGTH,
  OPERATOR_LENGTH,
  STATUS_START,
  SUB_STATUS,
  VOICE_LENGTH,
  VOICE_START,
} from "../sketchlib/dx7/dx7_constants.js";
import { DX7Cartridge } from "./DX7Cartridge.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7FreqSettings } from "./DX7FreqSettings.js";
import { DX7KeyLevelScaling, DX7ScalingCurve } from "./DX7KeyLevelScaling.js";
import { DX7LFO } from "./DX7LFO.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7Voice } from "./DX7Voice.js";

/**
 * Decode an envelope
 * @param {DataView} view arbitrary data view with envelope data
 * @param {number} offset Index where the envelope starts
 * @returns {DX7Envelope}
 */
function decode_envelope(view, offset) {
  const r1 = view.getUint8(offset + 0);
  const r2 = view.getUint8(offset + 1);
  const r3 = view.getUint8(offset + 2);
  const r4 = view.getUint8(offset + 3);
  const rates = [r1, r2, r3, r4];

  const l1 = view.getUint8(offset + 4);
  const l2 = view.getUint8(offset + 5);
  const l3 = view.getUint8(offset + 6);
  const l4 = view.getUint8(offset + 7);
  const levels = [l1, l2, l3, l4];

  return new DX7Envelope(rates, levels);
}

/**
 *
 * @param {DataView} view
 * @param {number} num Operator number 1-6
 * @returns {DX7Operator}
 */
function decode_operator(view, num) {
  const envelope = decode_envelope(view, 0);
  // 39 = C3
  const breakpoint = view.getUint8(8);
  const left_depth = view.getUint8(9);
  const right_depth = view.getUint8(10);
  const scaling_curves = view.getUint8(11);
  const left_curve = scaling_curves & 0b11;
  const right_curve = (scaling_curves >> 2) & 0b11;

  const detune_rate_scale = view.getUint8(12);
  const key_rate_scaling = detune_rate_scale & 0b111;
  const detune = detune_rate_scale >> 3;

  const sensitivity = view.getUint8(13);
  const amp_mod_sensitivity = sensitivity & 0b11;
  const key_vel_sensitivity = sensitivity >> 2;

  const level = view.getUint8(14);

  const coarse_mode = view.getUint8(15);
  const osc_mode = coarse_mode & 0b1;
  const freq_coarse = coarse_mode >> 1;

  const freq_fine = view.getUint8(16);

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
 * @param {DataView} view
 * @param {number} offset
 * @returns {DX7LFO}
 */
function decode_lfo(view, offset) {
  const speed = view.getUint8(offset + 0);
  const delay = view.getUint8(offset + 1);
  const pitch_mod_depth = view.getUint8(offset + 2);
  const amp_mod_depth = view.getUint8(offset + 3);

  const sensitivity_wave_sync = view.getUint8(offset + 4);
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
 * @param {DataView} voice_view A DataView that starts at the beginning of the desired voice
 * @returns {string} The decoded name
 */
function decode_name(voice_view) {
  const NAME_START = 118;
  const name_chars = new Array(NAME_LENGTH);
  for (let i = 0; i < name_chars.length; i++) {
    const name_ord = voice_view.getUint8(NAME_START + i);
    const name_str = String.fromCharCode(name_ord);
    name_chars[i] = name_str;
  }
  return name_chars.join("");
}

/**
 * Decode a single voice from part of a sysex dump
 * @param {DataView} voice_view A DataView that starts at the beginning of the desired voice's binary data
 * @returns {DX7Voice} The parsed patch
 */
function decode_voice(voice_view) {
  const operators = new Array(6);

  for (let i = 0; i < operators.length; i++) {
    const op_view = new DataView(
      voice_view.buffer,
      voice_view.byteOffset + i * OPERATOR_LENGTH,
      OPERATOR_LENGTH,
    );
    operators[i] = decode_operator(op_view, 6 - i);
  }
  // the operators are listed in reverse order in the SYSEX file
  operators.reverse();

  const PITCH_ENV_START = 102;
  const pitch_env = decode_envelope(voice_view, PITCH_ENV_START);

  const algorithm = voice_view.getUint8(110) + 1;

  const sync_feedback = voice_view.getUint8(111);
  const osc_key_sync = Boolean(sync_feedback >> 3);
  const feedback = sync_feedback & 0b111;

  // TODO: LFO
  const LFO_START = 112;
  const lfo = decode_lfo(voice_view, LFO_START);

  // transpose is stored as 0-48, but is a signed value -24 to 24
  const transpose = voice_view.getUint8(117) - 24;

  const name = decode_name(voice_view);

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
  const data_view = new DataView(buffer);
  const status_byte = data_view.getUint8(0);
  if (status_byte !== STATUS_START) {
    throw new Error(".syx file must start with 0xF0");
  }

  const id_num = data_view.getUint8(1);
  if (id_num !== ID_YAMAHA) {
    throw new Error(`incorrect manufacturer id: ${id_num}`);
  }

  const sub_status = data_view.getUint8(2);
  if (sub_status !== SUB_STATUS) {
    throw new Error("sub status must be 0");
  }

  const format_number = data_view.getUint8(3);
  if (format_number !== FORMAT_32_VOICES) {
    throw new Error(`Only 32-voice DX7 .syx files are supported`);
  }

  const byte_count_msb = data_view.getUint8(4);
  const byte_count_lsb = data_view.getUint8(5);
  const byte_count = (byte_count_msb << 7) | byte_count_lsb;

  if (byte_count !== DATA_LENGTH) {
    throw new Error(`incorrect data length for 32 voices: ${byte_count}`);
  }

  const voices = new Array(32);
  for (let i = 0; i < 32; i++) {
    const voice_view = new DataView(
      buffer,
      VOICE_START + VOICE_LENGTH * i,
      VOICE_LENGTH,
    );
    const voice = decode_voice(voice_view);
    voices[i] = voice;
  }

  // TODO: handle checksum, F7 end sysex byte

  return new DX7Cartridge(voices);
}
