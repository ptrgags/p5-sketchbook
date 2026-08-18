import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { ALGORITHMS } from "./algos.js";

function clear_errors() {
  expect_element("errors", HTMLParagraphElement).innerText = "";
}

/**
 * Print an error message on the page
 * @param {string} message
 */
function show_error(message) {
  expect_element("errors", HTMLParagraphElement).innerText = message;
}

const SCALING_CURVES = ["-LIN", "-EXP", "+EXP", "+LIN"];

/**
 *
 * @param {DataView} view arbitrary data view with envelope data
 * @param {number} start_index Index where the envelope starts
 * @returns
 */
function dx7_parse_env(view, start_index) {
  const r1 = view.getUint8(start_index + 0);
  const r2 = view.getUint8(start_index + 1);
  const r3 = view.getUint8(start_index + 2);
  const r4 = view.getUint8(start_index + 3);
  const rates = [r1, r2, r3, r4];

  const l1 = view.getUint8(start_index + 4);
  const l2 = view.getUint8(start_index + 5);
  const l3 = view.getUint8(start_index + 6);
  const l4 = view.getUint8(start_index + 7);
  const levels = [l1, l2, l3, l4];

  return { rates, levels };
}

/**
 *
 * @param {DataView} view
 * @param {number} index Operator index 1-6
 * @returns {*}
 */
function dx7_parse_op(view, index) {
  const env = dx7_parse_env(view, 0);
  // 39 = C3
  const breakpoint = view.getUint8(8);
  const left_depth = view.getUint8(9);
  const right_depth = view.getUint8(10);
  const scaling_curves = view.getUint8(11);
  const left_curve = scaling_curves & 0b11;
  const right_curve = (scaling_curves >> 2) & 0b11;

  const detune_scale = view.getUint8(12);
  const rate_scale = detune_scale & 0b111;
  const detune = detune_scale >> 3;

  const sensitivity = view.getUint8(13);
  const amp_mod_sensitivity = sensitivity & 0b11;
  const key_vel_sensitivity = sensitivity >> 2;

  const level = view.getUint8(14);

  const coarse_mode = view.getUint8(15);
  const osc_mode = coarse_mode & 0b1;
  const freq_coarse = coarse_mode >> 1;

  const freq_fine = view.getUint8(16);

  return {
    name: `OP ${index}`,
    env,
    level,
    amp_mod_sensitivity,
    key_vel_sensitivity,
    freq: {
      mode: osc_mode,
      detune,
      coarse: freq_coarse,
      fine: freq_fine,
    },
    scaling: {
      rate_scale,
      breakpoint,
      left: {
        depth: left_depth,
        curve: SCALING_CURVES[left_curve],
      },
      right: {
        depth: right_depth,
        curve: SCALING_CURVES[right_curve],
      },
    },
  };
}

/**
 *
 * @param {DataView} voice_view
 * @returns {String}
 */
function dx7_parse_name(voice_view) {
  const NAME_START = 118;
  const name_chars = new Array(10);
  for (let i = 0; i < name_chars.length; i++) {
    const name_ord = voice_view.getUint8(NAME_START + i);
    const name_str = String.fromCharCode(name_ord);
    name_chars[i] = name_str;
  }
  return name_chars.join("");
}

/**
 *
 * @param {DataView} view
 * @returns {*}
 */
function dx7_parse_voice(view) {
  const operators = new Array(6);
  const OP_LENGTH = 17;
  for (let i = 0; i < operators.length; i++) {
    const op_view = new DataView(
      view.buffer,
      view.byteOffset + i * OP_LENGTH,
      OP_LENGTH,
    );
    operators[i] = dx7_parse_op(op_view, 6 - i);
  }
  // the operators are listed in reverse order in the SYSEX file
  operators.reverse();

  const PITCH_ENV_START = 102;
  const pitch_env = dx7_parse_env(view, PITCH_ENV_START);

  const algorithm = view.getUint8(110) + 1;

  const sync_feedback = view.getUint8(111);
  const osc_key_sync = sync_feedback >> 3;
  const feedback = sync_feedback & 0b111;

  // TODO: osc key sync, LFO
  const transpose = view.getUint8(117);
  const name = dx7_parse_name(view);

  return {
    operators,
    pitch_env,
    algorithm,
    osc_key_sync,
    feedback,
    transpose,
    name,
  };
}

/**
 *
 * @see {@link https://homepages.abdn.ac.uk/d.j.benson/pages/dx7/sysex-format.txt | DX7 Sysex Format article}
 * @param {ArrayBuffer} buffer
 * @returns {*}
 */
function dx7_parse_voice_dump(buffer) {
  const data_view = new DataView(buffer);
  const status_byte = data_view.getUint8(0);
  const id_num = data_view.getUint8(1);
  const sub_status = data_view.getUint8(2);
  const format_number = data_view.getUint8(3);
  const byte_count_msb = data_view.getUint8(4);
  const byte_count_lsb = data_view.getUint8(5);
  const byte_count = (byte_count_msb << 7) | byte_count_lsb; // double check this

  const FIRST_VOICE_OFFSET = 6;
  const VOICE_LENGTH = 128;
  const voices = new Array(32);
  for (let i = 0; i < 32; i++) {
    const voice_view = new DataView(
      buffer,
      FIRST_VOICE_OFFSET + VOICE_LENGTH * i,
      VOICE_LENGTH,
    );
    const voice = dx7_parse_voice(voice_view);
    voices[i] = voice;
  }

  // TODO: checksum, F7 end sysex byte

  return {
    total_byte_length: buffer.byteLength,
    status_byte,
    id_num,
    sub_status,
    format_number,
    byte_count,
    voices,
  };
}

/**
 * @param {File[]} file_list
 * @returns {Promise<*>}
 */
async function import_dx7_data(file_list) {
  if (file_list.length === 0) {
    throw new Error(
      "please choose a .syx file from a Yamaha DX7/Dexed/M-Vave FM-1",
    );
  }

  const file = file_list[0];
  const buffer = await file.arrayBuffer();

  return dx7_parse_voice_dump(buffer);
}

// @ts-ignore
export const sketch = (p) => {
  let import_input;
  let algo = 0;
  let algo_prim = ALGORITHMS[algo];
  /**
   * @type {any}
   */
  let cartridge = undefined;
  let patch = 0;

  function load_patch() {
    if (cartridge) {
      const voice = cartridge.voices[patch];
      algo = voice.algorithm - 1;
      algo_prim = ALGORITHMS[algo];
    }
  }

  p.setup = () => {
    p.createCanvas(WIDTH, HEIGHT);
    p.pixelDensity(1);

    import_input = expect_element("sysex", HTMLInputElement);
    import_input.addEventListener("input", async (e) => {
      clear_errors();

      try {
        patch = 0;
        cartridge = await import_dx7_data(e.target.files);
        load_patch();
        console.log(cartridge);
      } catch (err) {
        console.error(err);
        const msg = err instanceof Error ? err.message : "unknown error";
        show_error(msg);
      }
    });
  };

  p.draw = () => {
    p.background(0);
    p.fill(127, 127, 0);
    algo_prim.draw(p);

    p.text(`Patch: ${patch + 1}`, 0, 612);
    p.text(`Algo: ${algo + 1}`, 0, 624);
  };

  p.mouseReleased = () => {
    if (!cartridge) {
      return;
    }

    patch = (patch + 1) % 32;
    load_patch();
  };
};
