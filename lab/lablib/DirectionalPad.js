import { Point } from "../../pga2d/objects.js";
import { Direction, to_y_down } from "../../sketchlib/Direction.js";
import {
  GroupPrimitive,
  PolygonPrimitive,
  RectPrimitive,
  VectorPrimitive,
} from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { MouseInCanvas, MouseInput } from "./MouseInput.js";
import { Rectangle } from "./Rectangle.js";

/**
 * A virtual pad of 4 directional buttons, modeled after the D-pad on
 * a gamepad or handheld console
 */
export class DirectionalPad {
  /**
   * Constructor
   * @param {Rectangle} rect The boundary rectangle within which the d-pad will be on the screen
   * @param {number} dead_zone_radius The size of the dead zone
   */
  constructor(rect, dead_zone_radius) {
    this.rect = rect;
    this.dead_zone_radius_sqr = dead_zone_radius * dead_zone_radius;

    /**
     * The analog value from [-1, 1] on both axes depending on the mouse
     * position relative to the center of the boundary rectangle. This is
     * stored as a Point.direction
     * @type {Point}
     */
    this.value = Point.ZERO;

    /**
     * Which cardinal direction was pressed
     * @type {Direction | undefined}
     */
    this.direction_pressed = undefined;

    /**
     * Cached geometry computed on the first call to render()
     * @type {PolygonPrimitive[] | undefined}
     */
    this.button_geometry = undefined;
  }

  clear_value() {
    this.value = Point.ZERO;
    this.direction_pressed = undefined;
  }

  /**
   * Once the point is determined to be in the rectangle, this function
   * @param {Point} point The mouse/touch position
   */
  update_value(point) {
    // Compute the coordinates from the center
    const { x, y } = point.sub(this.rect.center);
    const { x: x_scale, y: y_scale } = this.rect.dimensions.scale(0.5);
    const raw_value = Point.direction(x / x_scale, y / y_scale);

    // Allow a deadzone in the middle of the DPAD
    if (this.value.ideal_norm_sqr() < this.dead_zone_radius_sqr) {
      this.value = Point.ZERO;
      this.direction_pressed = undefined;
    }

    this.value = raw_value;

    const is_horizontal = Math.abs(this.value.x) > Math.abs(this.value.y);
    if (is_horizontal && this.value.x > 0) {
      this.direction_pressed = Direction.RIGHT;
    } else if (is_horizontal) {
      this.direction_pressed = Direction.LEFT;
    } else if (this.value.y > 0) {
      this.direction_pressed = Direction.DOWN;
    } else {
      this.direction_pressed = Direction.UP;
    }
  }

  /**
   * Mouse pressed handler
   * @param {Point} point The mouse coordinates relative to the canvas in pixels
   */
  mouse_pressed(point) {
    if (this.rect.contains(point)) {
      this.update_value(point);
    } else {
      this.clear_value();
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
      this.clear_value();
    }

    this.update_value(mouse_input.mouse_coords);
  }

  /**
   * Mouse released handler - regardless of where the mouse is,
   * release the D-pad buttons
   */
  mouse_released() {
    this.clear_value();
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

    const right_button = new PolygonPrimitive([
      center,
      mid_dr,
      edge_rd,
      edge_ru,
      mid_ur,
    ]);

    const up_button = new PolygonPrimitive([
      center,
      mid_ur,
      edge_ur,
      edge_ul,
      mid_ul,
    ]);

    const left_button = new PolygonPrimitive([
      center,
      mid_ul,
      edge_lu,
      edge_ld,
      mid_dl,
    ]);

    const down_button = new PolygonPrimitive([
      center,
      mid_dl,
      edge_dl,
      edge_dr,
      mid_dr,
    ]);
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
      if (this.direction_pressed === direction) {
        pressed_buttons.push(x);
      } else {
        idle_buttons.push(x);
      }
    }

    const STYLE_IDLE = Style.DEFAULT_STROKE.with_width(2);
    const STYLE_PRESSED = Style.DEFAULT_STROKE_FILL.with_width(2);

    const idle_group = new GroupPrimitive(idle_buttons, STYLE_IDLE);
    const pressed_group = new GroupPrimitive(pressed_buttons, STYLE_PRESSED);

    return new GroupPrimitive([idle_group, pressed_group]);
  }

  debug_render() {
    const boundary = new RectPrimitive(
      this.rect.position,
      this.rect.dimensions
    );

    const center = this.rect.center;
    const half_dimensions = this.rect.dimensions.scale(0.5);
    const arrow_offset = Point.direction(
      this.value.x * half_dimensions.x,
      this.value.y * half_dimensions.y
    );
    const value_arrow = new VectorPrimitive(center, center.add(arrow_offset));

    const direction =
      this.direction_pressed !== undefined
        ? to_y_down(this.direction_pressed)
        : Point.ZERO;
    const direction_offset = Point.direction(
      direction.x * half_dimensions.x,
      direction.y * half_dimensions.y
    );
    const direction_arrow = new VectorPrimitive(
      center,
      center.add(direction_offset)
    );

    return new GroupPrimitive(
      [boundary, value_arrow, direction_arrow],
      Style.DEFAULT_STROKE
    );
  }
}
