import { HEIGHT, WIDTH } from "../sketchlib/dimensions.js";
import { Primitive } from "../sketchlib/primitives/Primitive.js";

function draw_grid(p, spacing) {
  for (let i = 0; i < WIDTH / spacing + 1; i++) {
    p.line(i * spacing, 0, i * spacing, HEIGHT);
  }
  for (let i = 0; i < HEIGHT / spacing + 1; i++) {
    p.line(0, i * spacing, WIDTH, i * spacing);
  }
}

/**
 * Debug overlay that draws a grid over everything for checking coordinates
 * @implements {Primitive}
 */
export class DebugGrid {
  /**
   * Constructor
   * @param {number} major_spacing Spacing of major grid lines (drawn in red)
   * @param {number} minor_spacing Spacing of minor grid lines (drawn in grey)
   */
  constructor(major_spacing, minor_spacing) {
    this.major_spacing = major_spacing;
    this.minor_spacing = minor_spacing;
  }

  draw(p) {
    p.push();
    // Every 25 pixels, draw thin grid lines
    p.strokeWeight(1);
    p.stroke(200);
    draw_grid(p, this.minor_spacing);

    // Every 100 pixels, draw grid lines
    p.strokeWeight(2);
    p.stroke(255, 0, 0);
    draw_grid(p, this.major_spacing);
    p.pop();
  }
}
