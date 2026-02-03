import { Point } from "../sketchlib/pga2d/Point.js";
import { Color } from "./Color.js";
import { HEIGHT, WIDTH } from "./dimensions.js";
import { PolygonPrimitive } from "./primitives/PolygonPrimitive.js";
import { group, style } from "./primitives/shorthand.js";
import { Style } from "./Style.js";
import { SCREEN_RECT } from "./Rectangle.js";
import { TouchButton } from "./TouchButton.js";

const TRIANGLE_WIDTH = 200;
const PLAY_TRIANGLE = new PolygonPrimitive(
  [
    new Point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 - TRIANGLE_WIDTH / 2),
    new Point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 + TRIANGLE_WIDTH / 2),
    new Point(WIDTH / 2 + TRIANGLE_WIDTH / 2, HEIGHT / 2),
  ],
  true,
);
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
