import { decode_dx7 } from "../DX7PatchViewer/decode_dx7.js";
import { DX7Voice } from "../DX7PatchViewer/DX7Voice.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { decode_opm } from "./decode_opm.js";

/**
 *
 * @param {HTMLElement} element
 */
function clear_children(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export class DX7CartridgeOrganizer {
  constructor() {
    /**
     * Available voices in the left column
     * @type {DX7Voice[]}
     */
    this.voices = [];

    /**
     * Voices in the 32-voice cartridge we are building in the right column
     * @type {DX7Voice[]}
     */
    this.cartridge_voices = [];
  }

  init_ui() {
    const voices_select = expect_element("voices", HTMLSelectElement);
    const import_input = expect_element("import", HTMLInputElement);

    const add_button = expect_element("add", HTMLButtonElement);
    const move_up_button = expect_element("move-up", HTMLButtonElement);
    const move_down_button = expect_element("move-down", HTMLButtonElement);
    const delete_button = expect_element("delete", HTMLButtonElement);
    const cartridge_select = expect_element("cartridge", HTMLSelectElement);
    const voice_name_text = expect_element("voice-name", HTMLInputElement);
    const rename_button = expect_element("rename", HTMLButtonElement);
    const export_button = expect_element("export", HTMLButtonElement);

    // When a new syx file is imported, add the voices to the list
    import_input.addEventListener("input", async () => {
      const files = import_input.files;
      if (!files || files.length === 0) {
        throw new Error("Please select a DX7 cartridge file (.syx)");
      }

      const [file] = files;

      if (file.name.endsWith(".opm")) {
        const opm_text = await file.text();
        const voices = decode_opm(opm_text);
        console.log(voices);
        this.voices.push(...voices.map((v) => v.to_dx7_voice()));
      } else {
        // .syx file
        const syx_buffer = await file.arrayBuffer();
        const dx7_cartridge = decode_dx7(syx_buffer);
        this.voices.push(...dx7_cartridge.voices);
      }

      // Otherwise it's a .syx file

      clear_children(voices_select);

      for (const [i, voice] of this.voices.entries()) {
        const option = document.createElement("option");
        option.innerHTML = voice.name;
        option.value = i.toString();
        voices_select.appendChild(option);
      }
    });

    const update_add_button = () => {
      const has_room_for_more = this.cartridge_voices.length < 32;
      add_button.disabled = !has_room_for_more;
    };

    // When a voice is selected, light up the add button
    voices_select.addEventListener("input", () => {
      update_add_button();
    });

    add_button.addEventListener("click", () => {
      const index = voices_select.selectedIndex;

      const voice = this.voices[index];

      this.cartridge_voices.push(voice);

      const option = document.createElement("option");
      option.innerHTML = voice.name;
      option.value = index.toString();
      cartridge_select.appendChild(option);

      export_button.disabled = false;

      // if we filled up the cartridge, disable this button
      update_add_button();
    });

    const update_move_buttons = () => {
      const index = cartridge_select.selectedIndex;
      const can_move_up = index > 0;
      const can_move_down = index < this.cartridge_voices.length - 1;

      move_up_button.disabled = !can_move_up;
      move_down_button.disabled = !can_move_down;
    };

    const update_voice_name = () => {
      const index = cartridge_select.selectedIndex;
      const voice = this.cartridge_voices[index];

      voice_name_text.value = voice.name;
      voice_name_text.disabled = false;
    };

    cartridge_select.addEventListener("input", () => {
      update_move_buttons();
      update_voice_name();

      delete_button.disabled = false;

      // Uncomment when I'm ready to do the exporting
      // rename_button.disabled = false;
    });

    rename_button.addEventListener("click", () => {
      const index = cartridge_select.selectedIndex;
      const new_name = voice_name_text.value;

      cartridge_select.children[index].innerHTML = new_name;

      const voice = this.cartridge_voices[index];
      this.cartridge_voices[index] = voice.rename(new_name);
    });

    /**
     *
     * @param {number} index_a
     * @param {number} index_b
     */
    const swap_cartridge_voices = (index_a, index_b) => {
      const voices = this.cartridge_voices;
      [voices[index_a], voices[index_b]] = [voices[index_b], voices[index_a]];

      const children = [...cartridge_select.children];
      [children[index_a], children[index_b]] = [
        children[index_b],
        children[index_a],
      ];
      cartridge_select.replaceChildren(...children);
      cartridge_select.selectedIndex = index_b;

      update_move_buttons();
      update_voice_name();
    };

    move_up_button.addEventListener("click", () => {
      const index_a = cartridge_select.selectedIndex;
      const index_b = index_a - 1;
      swap_cartridge_voices(index_a, index_b);
    });

    move_down_button.addEventListener("click", () => {
      const index_a = cartridge_select.selectedIndex;
      const index_b = index_a + 1;
      swap_cartridge_voices(index_a, index_b);
    });

    delete_button.addEventListener("click", () => {
      const index = cartridge_select.selectedIndex;
      const is_last = this.cartridge_voices.length === 1;

      this.cartridge_voices.splice(index, 1);
      const option = cartridge_select.children[index];
      cartridge_select.removeChild(option);

      if (is_last) {
        // we removed the last voice from the list, so now most of the
        // controls can be turned off
        move_up_button.disabled = true;
        move_down_button.disabled = true;
        delete_button.disabled = true;
        voice_name_text.value = "";
        voice_name_text.disabled = true;
        export_button.disabled = true;
        rename_button.disabled = true;
      } else {
        // Update UI buttons
        cartridge_select.selectedIndex =
          index < this.cartridge_voices.length ? index : index - 1;
        update_move_buttons();
        update_voice_name();
      }

      // Since we removed a voice, there will always be room for more!
      update_add_button();
    });
  }
}
