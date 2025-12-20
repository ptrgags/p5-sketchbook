import { Point } from "../../pga2d/objects.js";
import { Direction, to_y_down } from "../../sketchlib/Direction.js";
import { GroupPrimitive } from "../../sketchlib/primitives/GroupPrimitive.js";
import { PolygonPrimitive } from "../../sketchlib/primitives/PolygonPrimitive.js";
import { RectPrimitive } from "../../sketchlib/primitives/RectPrimitive.js";
import { group, style } from "../../sketchlib/primitives/shorthand.js";
import { VectorPrimitive } from "../../sketchlib/primitives/VectorPrimitive.js";
import { Style } from "../../sketchlib/Style.js";
import { DirectionInput } from "./DirectionInput.js";
import { MouseInCanvas, MouseInput } from "./MouseInput.js";
import { Rectangle } from "./Rectangle.js";

/**
 * A virtual pad of 4 directional buttons, modeled after the D-pad on
 * a gamepad or handheld console
 */
export class TouchDPad {
  /**
   * Constructor
   * @param {Rectangle} rect The boundary rectangle within which the d-pad will be on the screen
   * @param {number} dead_zone_radius The size of the dead zone in _normalized coordinates_
   */
  constructor(rect, dead_zone_radius) {
    this.rect = rect;
    this.dead_zone_radius_sqr = dead_zone_radius * dead_zone_radius;

    this.direction = DirectionInput.NO_INPUT;

    /**
     * Cached geometry computed on the first call to render()
     * @type {PolygonPrimitive[] | undefined}
     */
    this.button_geometry = undefined;
  }

  /**
   * Once the point is determined to be in the rectangle, this function
   * @param {Point} point The mouse/touch position
   */
  update_direction(point) {
    // Compute the coordinates from the center
    const { x, y } = point.sub(this.rect.center);
    const { x: x_scale, y: y_scale } = this.rect.dimensions.scale(0.5);
    const analog_value = Point.direction(x / x_scale, y / y_scale);

    // Allow a deadzone in the middle of the DPAD
    if (analog_value.ideal_norm_sqr() < this.dead_zone_radius_sqr) {
      this.direction = DirectionInput.NO_INPUT;
      return;
    }

    const is_horizontal = Math.abs(analog_value.x) > Math.abs(analog_value.y);
    let digital_direction;
    if (is_horizontal && analog_value.x > 0) {
      digital_direction = Direction.RIGHT;
    } else if (is_horizontal) {
      digital_direction = Direction.LEFT;
    } else if (analog_value.y > 0) {
      digital_direction = Direction.DOWN;
    } else {
      digital_direction = Direction.UP;
    }

    this.direction = new DirectionInput(digital_direction, analog_value);
  }

  /**
   * Mouse pressed handler
   * @param {Point} point The mouse coordinates relative to the canvas in pixels
   */
  mouse_pressed(point) {
    if (this.rect.contains(point)) {
      this.update_direction(point);
    } else {
      this.direction = DirectionInput.NO_INPUT;
    }
  }

  /**
   * Mouse dragged handler
   * @param {MouseInput} mouse_input The sanitized mouse input event
   */
  mouse_dragged(mouse_input) {
    if (
      mouse_input.in_canvas === MouseInCanvas.NOT_IN_CANVAS ||
      !this.rect.contains(mouse_input.mouse_coords)
    ) {
      this.direction = DirectionInput.NO_INPUT;
    } else {
      this.update_direction(mouse_input.mouse_coords);
    }
  }

  /**
   * Mouse released handler - regardless of where the mouse is,
   * release the D-pad buttons
   */
  mouse_released() {
    this.direction = DirectionInput.NO_INPUT;
  }

  /**
   * Make geometry for the four buttons. This only needs to be
   * computed once
   * @private
   * @returns {PolygonPrimitive[]} The 4 buttons as pentagons
   */
  make_button_geometry() {
    const center = this.rect.center;
    const top_left = this.rect.position;
    const bottom_right = this.rect.position.add(this.rect.dimensions);

    const across = Point.direction(this.rect.dimensions.x, 0);
    const down = Point.direction(0, this.rect.dimensions.y);
    const top_right = top_left.add(across);
    const bottom_left = top_left.add(down);

    const mid_ul = Point.lerp(top_left, bottom_right, 0.25);
    const mid_dr = Point.lerp(top_left, bottom_right, 0.75);
    const mid_dl = Point.lerp(bottom_left, top_right, 0.25);
    const mid_ur = Point.lerp(bottom_left, top_right, 0.75);

    const edge_rd = Point.lerp(bottom_right, top_right, 0.25);
    const edge_ru = Point.lerp(bottom_right, top_right, 0.75);
    const edge_ul = Point.lerp(top_left, top_right, 0.25);
    const edge_ur = Point.lerp(top_left, top_right, 0.75);
    const edge_ld = Point.lerp(bottom_left, top_left, 0.25);
    const edge_lu = Point.lerp(bottom_left, top_left, 0.75);
    const edge_dl = Point.lerp(bottom_left, bottom_right, 0.25);
    const edge_dr = Point.lerp(bottom_left, bottom_right, 0.75);

    const right_button = new PolygonPrimitive(
      [center, mid_dr, edge_rd, edge_ru, mid_ur],
      true
    );

    const up_button = new PolygonPrimitive(
      [center, mid_ur, edge_ur, edge_ul, mid_ul],
      true
    );

    const left_button = new PolygonPrimitive(
      [center, mid_ul, edge_lu, edge_ld, mid_dl],
      true
    );

    const down_button = new PolygonPrimitive(
      [center, mid_dl, edge_dl, edge_dr, mid_dr],
      true
    );
    return [right_button, up_button, left_button, down_button];
  }

  /**
   * Render a virtual D-pad
   * @returns {GroupPrimitive} the 4 buttons, suitable for a mobile overlay
   */
  render() {
    if (this.button_geometry === undefined) {
      this.button_geometry = this.make_button_geometry();
    }

    const idle_buttons = [];
    const pressed_buttons = [];

    for (const [direction, x] of this.button_geometry.entries()) {
      if (this.direction.digital === direction) {
        pressed_buttons.push(x);
      } else {
        idle_buttons.push(x);
      }
    }

    const STYLE_IDLE = Style.DEFAULT_STROKE.with_width(2);
    const STYLE_PRESSED = Style.DEFAULT_STROKE_FILL.with_width(2);

    const idle_group = style(idle_buttons, STYLE_IDLE);
    const pressed_group = style(pressed_buttons, STYLE_PRESSED);

    return group(idle_group, pressed_group);
  }

  debug_render() {
    const boundary = new RectPrimitive(
      this.rect.position,
      this.rect.dimensions
    );
    const center = this.rect.center;
    const half_dimensions = this.rect.dimensions.scale(0.5);

    const analog_direction = this.direction.analog;
    const analog_offset = Point.direction(
      analog_direction.x * half_dimensions.x,
      analog_direction.y * half_dimensions.y
    );
    const analog_arrow = new VectorPrimitive(center, center.add(analog_offset));

    const digital_direction = to_y_down(this.direction.digital);
    const digital_offset = Point.direction(
      digital_direction.x * half_dimensions.x,
      digital_direction.y * half_dimensions.y
    );
    const digital_arrow = new VectorPrimitive(
      center,
      center.add(digital_offset)
    );

    return style([boundary, analog_arrow, digital_arrow], Style.DEFAULT_STROKE);
  }
}
