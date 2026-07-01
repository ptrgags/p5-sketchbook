import { SCREEN_CENTER } from "../sketchlib/dimensions.js";
import { Point } from "../sketchlib/pga2d/Point.js";
import { Circle } from "../sketchlib/primitives/Circle.js";
import { group, style } from "../sketchlib/primitives/shorthand.js";
import { ShowHidePrimitive } from "../sketchlib/primitives/ShowHidePrimitive.js";
import { Style } from "../sketchlib/Style.js";
import { COLOR_BEZEL_HIGHLIGHT, DIAL_RADIUS } from "./constants.js";

const BEZEL_THICKNESS = 30;

const STYLE_HIGHLIGHT = new Style({
  stroke: COLOR_BEZEL_HIGHLIGHT,
  width: BEZEL_THICKNESS,
});

const HIGHLIGHT_CIRCLE = style(
  new Circle(SCREEN_CENTER, DIAL_RADIUS),
  STYLE_HIGHLIGHT,
);

export class Bezel {
  constructor() {
    this.highlight = new ShowHidePrimitive([HIGHLIGHT_CIRCLE], [false]);
    this.primitive = group(this.highlight);
  }

  /**
   * Update the bezel highlight
   * @param {Point} mouse_coords
   */
  update_highlight(mouse_coords) {
    this.highlight.show_flags = [this.is_hovering(mouse_coords)];
  }

  /**
   * Check if the mouse is over the bezel circle
   * @param {Point} mouse_coords
   * @returns {boolean}
   */
  is_hovering(mouse_coords) {
    const dist_center = mouse_coords.dist(SCREEN_CENTER);

    return Math.abs(dist_center - DIAL_RADIUS) < 0.5 * BEZEL_THICKNESS;
  }
}
