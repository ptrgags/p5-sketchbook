import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { group } from "../sketchlib/primitives/shorthand.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { ALGORITHMS } from "./algos.js";
import { decode_dx7 } from "./decode_dx7.js";
import { DX7Cartridge } from "./DX7Cartridge.js";

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

const DX7FreqMode = {
  RATIO: 0,
  FIXED: 1,
};

/**
 *
 * @param {number} detune
 * @returns {String}
 */
function format_detune(detune) {
  if (detune == 0) {
    return "";
  }

  if (detune < 0) {
    return ` ${detune}`;
  }

  return ` +${detune}`;
}

/**
 *
 * @param {*} freq
 * @returns {string}
 */
function format_freq(freq) {
  const detune = freq.detune - 7;

  if (freq.mode === DX7FreqMode.RATIO) {
    const coarse = freq.coarse === 0 ? 0.5 : freq.coarse;
    const fine = freq.fine;
    const ratio = coarse + fine;
    return `${ratio.toFixed(2)}${format_detune(detune)}`;
  }

  const power_of_10 = freq.coarse % 4;
  const base_hz = 10 ** power_of_10;
  // By observing values in Dexed, I see that the fine knob is measured in
  // units of 10^(1/100). Kinda like cents but... in base 10. Is there a name
  // for that?
  const scale_factor = 10 ** (freq.fine / 100);
  const hz = base_hz * scale_factor;

  return `${hz.toPrecision(6)} Hz ${format_detune(detune)}`;
}

class OperatorInfo {
  /**
   * Constructor
   * @param {*} operator
   * @param {Point} position
   */
  constructor(operator, position) {
    const text = `${operator.name}\nf = ${format_freq(operator.freq)}\nlevel=${operator.level}`;
    this.primitive = new TextPrimitive(text, position);
  }

  /**
   *
   * @param {import("p5").default} p
   */
  draw(p) {
    this.primitive.draw(p);
  }
}

/**
 * @param {File[]} file_list
 * @returns {Promise<DX7Cartridge>}
 */
async function import_dx7_data(file_list) {
  if (file_list.length === 0) {
    throw new Error(
      "please choose a .syx file from a Yamaha DX7/Dexed/M-Vave FM-1",
    );
  }

  const file = file_list[0];
  const buffer = await file.arrayBuffer();

  return decode_dx7(buffer);
}

const OPERATOR_LABELS = new GroupPrimitive([], {
  style: Style.flat(Color.RED),
  text_style: new TextStyle(12, "left", "top"),
});

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
  let patch_name = "";

  function load_patch() {
    if (cartridge) {
      const instrument = cartridge.voices[patch];
      algo = instrument.algorithm - 1;
      algo_prim = ALGORITHMS[algo];
      patch_name = instrument.name;

      const voice_prims = instrument.operators.map((v, i) => {
        const card_rect = algo_prim.get_operator_rect(i);
        return new OperatorInfo(v, card_rect.position);
      });

      OPERATOR_LABELS.regroup(...voice_prims);
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
    OPERATOR_LABELS.draw(p);

    p.text(`Patch: ${patch + 1} (${patch_name})`, 0, 612);
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
