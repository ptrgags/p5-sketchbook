import { Point } from "../sketchlib/pga2d/Point.js";
import { Color } from "./Color.js";
import { HEIGHT, WIDTH } from "./dimensions.js";
import { PolygonPrimitive } from "./primitives/PolygonPrimitive.js";
import { group, style } from "./primitives/shorthand.js";
import { Style } from "./Style.js";
import { SCREEN_RECT } from "./Rectangle.js";
import { TouchButton } from "./TouchButton.js";
import { MouseCallbacks } from "./input/MouseCallbacks.js";
import { MouseInput } from "./MouseInput.js";
import { Animated } from "./animation/Animated.js";

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

/**
 * @implements {Animated}
 */
export class PlayButton {
  constructor() {
    this.button = new TouchButton(SCREEN_RECT);

    this.primitive = group(this.button.primitive, PLAY_GROUP);
  }

  get events() {
    return this.button.events;
  }

  update() {
    this.button.update();
  }

  /**
   * @type {MouseCallbacks}
   */
  get mouse_callbacks() {
    return this.button;
  }
}
