import { Color } from "../sketchlib/Color.js";
import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { GroupPrimitive } from "../sketchlib/primitives/GroupPrimitive.js";
import { TextPrimitive } from "../sketchlib/primitives/TextPrimitive.js";
import { TextStyle } from "../sketchlib/primitives/TextStyle.js";
import { Style } from "../sketchlib/Style.js";
import { ALGORITHMS } from "./algos.js";
import { decode_dx7 } from "./decode_dx7.js";
import { DX7Cartridge } from "./DX7Cartridge.js";
import { DX7Operator } from "./DX7Operator.js";

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

class OperatorInfo {
  /**
   * Constructor
   * @param {DX7Operator} operator
   * @param {Point} position
   */
  constructor(operator, position) {
    const text = `${operator.name}    L:${operator.level}\nf:${operator.freq}\n${operator.envelope}\n${operator.key_scaling}`;
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
   * @type {DX7Cartridge | undefined}
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

    const feedback = cartridge?.voices[patch].feedback ?? 0;

    p.text(
      `Patch ${patch + 1}: ${patch_name}\nAlgo: ${algo + 1} Feedback ${feedback}`,
      0,
      612,
    );
  };

  p.mouseReleased = () => {
    if (!cartridge) {
      return;
    }

    patch = (patch + 1) % 32;
    load_patch();
  };
};
