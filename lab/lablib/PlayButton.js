import { Point } from "../../pga2d/objects.js";
import { Color } from "../../sketchlib/Color.js";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions.js";
import { GroupPrimitive } from "../../sketchlib/rendering/GroupPrimitive.js";
import { PolygonPrimitive } from "../../sketchlib/rendering/primitives.js";
import { group, style } from "../../sketchlib/rendering/shorthand.js";
import { Style } from "../../sketchlib/Style.js";
import { SCREEN_RECT } from "./Rectangle.js";
import { TouchButton } from "./TouchButton.js";

const TRIANGLE_WIDTH = 200;
const PLAY_TRIANGLE = new PolygonPrimitive([
  Point.point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 - TRIANGLE_WIDTH / 2),
  Point.point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 + TRIANGLE_WIDTH / 2),
  Point.point(WIDTH / 2 + TRIANGLE_WIDTH / 2, HEIGHT / 2),
]);
const PLAY_GROUP = style(PLAY_TRIANGLE, new Style({ stroke: Color.WHITE }));

export class PlayButton {
  constructor() {
    this.button = new TouchButton(SCREEN_RECT);
  }

  get events() {
    return this.button.events;
  }

  render() {
    const button_back = this.button.debug_render();
    return group(button_back, PLAY_GROUP);
  }

  mouse_pressed(input) {
    this.button.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    this.button.mouse_dragged(input.mouse_coords);
  }

  mouse_dragged(input) {
    this.button.mouse_dragged(input.mouse_coords);
  }

  mouse_released(input) {
    this.button.mouse_released(input.mouse_coords);
  }
}
