import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Color } from "../sketchlib/Color.js";
import { draw_primitive } from "../sketchlib/p5_helpers/draw_primitive.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { InteractiveMosaic } from "./InteractiveMosaic.js";
import { prevent_mobile_scroll } from "../sketchlib/prevent_mobile_scroll.js";

//const INITIAL_COLORS = ["#231f20", "#bb4430", "#7ebdc2", "#f3dfa2"];
// clouds, sky, grass, dirt
const INITIAL_COLORS = ["#ccf0ef", "#5697d8", "#456538", "#633912"];

export const sketch = (p) => {
  let canvas;

  const colors = INITIAL_COLORS.map((x) => Color.from_hex_code(x));
  const mosaic = new InteractiveMosaic(colors);

  function init_color_pickers() {
    for (const [i, color] of colors.entries()) {
      const color_picker = document.getElementById(`color-${i}`);
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

  function init_image_save_button() {
    document.getElementById("save-image").addEventListener("click", () => {
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
    canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;
    prevent_mobile_scroll(canvas);

    init_color_pickers();
    init_image_save_button();
  };

  p.draw = () => {
    p.background(0);

    draw_primitive(p, mosaic.render(p.frameCount));

    mosaic.update(p.frameCount);
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
};
