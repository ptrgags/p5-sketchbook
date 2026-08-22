import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Color } from "../sketchlib/Color.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { InteractiveMosaic } from "./InteractiveMosaic.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";
import { expect_element } from "../sketchlib/dom/expect_element.js";
import { KeywordRecognizer } from "../sketchlib/KeywordRecognizer.js";

// clouds, sky, grass, dirt
const INITIAL_COLORS = ["#ccf0ef", "#5697d8", "#456538", "#633912"];

const SLASH = new KeywordRecognizer();

// Colors of actual LEGO tiles I use for the IRL mosaics
// I used https://rebrickable.com/colors/ for the hex codes
// and https://v2.bricklink.com/en-us/catalog/color-guide to check if I
// selected the right shades
const PRESET_COLORS = [
  "#05131d", // black
  "#562d80", // purple
  "#ffffff", // white
  "#f8fc0d", // vibrant yellow
  "#720e0f", // dark red
  "#0a3463", // dark blue
  "#fe8a18", // orange
  "#008f9b", // dark turquoise
].map(Color.from_hex_code);

/**
 * @param {import("p5").default} p
 */
export const sketch = (p) => {
  /**
   * @type {HTMLCanvasElement}
   */
  let canvas;

  const colors = INITIAL_COLORS.map(Color.from_hex_code);
  const mosaic = new InteractiveMosaic(colors);

  function init_color_pickers() {
    for (const [i, color] of colors.entries()) {
      const color_picker = expect_element(`color-${i}`, HTMLInputElement);
      /** @ts-ignore */
      color_picker.value = color.to_hex_code();
      color_picker.addEventListener("input", (e) => {
        /** @ts-ignore */
        const hex_code = e.target.value;
        const color = Color.from_hex_code(hex_code);
        mosaic.update_color(i, color);
      });
    }
  }

  function show_slash_help() {
    const key_div = expect_element("slash-help", HTMLDivElement);
    key_div.style.display = "block";
  }

  // Add slash commands /colorij where
  // i is the color slot 0-3
  // j is the index in the palette 0-7
  // these will load preset colors
  function init_slash_commands() {
    SLASH.slash(`/key`, show_slash_help);
    SLASH.slash(`/color`, show_slash_help);

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 8; j++) {
        SLASH.slash(`/color${i}${j}`, () => {
          const color_picker = expect_element(`color-${i}`, HTMLInputElement);
          const color = PRESET_COLORS[j];
          color_picker.value = color.to_hex_code();
          mosaic.update_color(i, color);
        });
      }
    }
  }

  function init_image_save_button() {
    const save_button = expect_element("save-image", HTMLButtonElement);
    save_button.addEventListener("click", () => {
      const colors = mosaic.get_colors();
      const width = 16;
      const image = p.createImage(width, width);
      image.loadPixels();
      for (const [i, color] of colors.entries()) {
        image.pixels[4 * i] = color.r;
        image.pixels[4 * i + 1] = color.g;
        image.pixels[4 * i + 2] = color.b;
        image.pixels[4 * i + 3] = 255;
      }
      image.updatePixels();
      image.save("mosaic", "png");
    });
  }

  p.setup = () => {
    canvas = p.createCanvas(WIDTH, HEIGHT).elt;
    p.pixelDensity(1);
    prevent_mobile_scroll(canvas);

    init_color_pickers();
    init_image_save_button();
    init_slash_commands();
  };

  p.draw = () => {
    p.background(0);

    mosaic.update(p.frameCount);
    mosaic.render(p.frameCount).draw(p);
  };

  p.mousePressed = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    mosaic.mouse_press(mouse);
  };

  p.mouseDragged = () => {
    const mouse = fix_mouse_coords(canvas, p.mouseX, p.mouseY);
    mosaic.mouse_drag(mouse);
  };

  p.mouseReleased = () => {
    mosaic.mouse_release();
  };

  p.keyReleased = (/** @type {KeyboardEvent} */ e) => {
    SLASH.input(e.code);
  };
};
