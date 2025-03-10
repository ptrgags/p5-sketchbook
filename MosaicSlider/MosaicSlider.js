import { WIDTH, HEIGHT } from "../sketchlib/dimensions.js";
import { Color } from "../sketchlib/Style.js";
import { draw_primitive } from "../sketchlib/draw_primitive.js";
import { fix_mouse_coords } from "../sketchlib/fix_mouse_coords.js";
import { InteractiveMosaic } from "./InteractiveMosaic.js";

const INITIAL_COLORS = ["#231f20", "#bb4430", "#7ebdc2", "#f3dfa2"];

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

  p.setup = () => {
    canvas = p.createCanvas(
      WIDTH,
      HEIGHT,
      undefined,
      document.getElementById("sketch-canvas")
    ).elt;

    init_color_pickers();
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
