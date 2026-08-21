import { decode_dx7 } from "../DX7PatchViewer/decode_dx7.js";
import { DX7Voice } from "../DX7PatchViewer/DX7Voice.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";

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

      const [syx_file] = files;
      const syx_buffer = await syx_file.arrayBuffer();

      const dx7_cartridge = decode_dx7(syx_buffer);
      this.voices.push(...dx7_cartridge.voices);

      clear_children(voices_select);

      for (const [i, voice] of this.voices.entries()) {
        const option = document.createElement("option");
        option.innerHTML = voice.name;
        option.value = i.toString();
        voices_select.appendChild(option);
      }
    });

    // When a voice is selected, light up the add button
    voices_select.addEventListener("input", () => {
      add_button.disabled = false;
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
    });

    cartridge_select.addEventListener("input", () => {
      move_up_button.disabled = false;
      move_down_button.disabled = false;

      const index = cartridge_select.selectedIndex;
      const voice = this.cartridge_voices[index];

      voice_name_text.value = voice.name;
      voice_name_text.disabled = false;

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
  }
}
