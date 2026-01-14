import { Primitive } from "../../sketchlib/primitives/Primitive.js";

/**
 * @implements {Primitive}
 */
export class DebugCoordinates {
  draw(p) {
    const mouse_x = Math.floor(p.mouseX);
    const mouse_y = Math.floor(p.mouseY);

    p.push();
    p.textSize(16);

    p.fill(16);
    p.rect(mouse_x, mouse_y - 16, 75, 24);

    p.fill(200);
    p.text(`(${mouse_x}, ${mouse_y})`, mouse_x, mouse_y);
    p.pop();
  }
}
