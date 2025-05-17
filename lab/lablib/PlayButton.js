import { Point } from "../../pga2d/objects";
import { Color } from "../../sketchlib/Color";
import { HEIGHT, WIDTH } from "../../sketchlib/dimensions";
import { draw_primitive } from "../../sketchlib/draw_primitive";
import { GroupPrimitive, PolygonPrimitive } from "../../sketchlib/primitives";
import { Style } from "../../sketchlib/Style";
import { SCREEN_RECT } from "./Rectangle";
import { TouchButton } from "./TouchButton";

const TRIANGLE_WIDTH = 200;
const PLAY_TRIANGLE = new PolygonPrimitive([
  Point.point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 - TRIANGLE_WIDTH / 2),
  Point.point(WIDTH / 2 - TRIANGLE_WIDTH / 2, HEIGHT / 2 + TRIANGLE_WIDTH / 2),
  Point.point(WIDTH / 2 + TRIANGLE_WIDTH / 2, HEIGHT / 2),
]);
const PLAY_GROUP = new GroupPrimitive(
  [PLAY_TRIANGLE],
  new Style({ stroke: Color.WHITE })
);

export class PlayButton {
  constructor() {
    this.button = new TouchButton(SCREEN_RECT);
  }

  render() {
    const button_back = this.button.debug_render();
    return new GroupPrimitive([button_back, PLAY_GROUP]);
  }

  mouse_pressed(input) {
    this.button.mouse_pressed(input.mouse_coords);
  }

  mouse_moved(input) {
    this.button.mouse_dragged(input.mouse_coords);
  }
}
