import { Point } from "../../pga2d/objects.js";
import { Direction } from "../../sketchlib/Direction.js";
import {
  GroupPrimitive,
  RectPrimitive,
  VectorPrimitive,
} from "../../sketchlib/primitives.js";
import { Style } from "../../sketchlib/Style.js";
import { Rectangle } from "./Rectangle.js";

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

  mouse_pressed(point) {
    if (this.rect.contains(point)) {
      this.update_value(point);
    } else {
      this.clear_value();
    }
  }

  mouse_dragged(point) {
    if (this.rect.contains(point)) {
      this.update_value(point);
    } else {
      this.clear_value();
    }
  }

  mouse_released() {
    this.clear_value();
  }

  render() {
    const center = this.rect.center;
    const half_dimensions = this.rect.dimensions.scale(0.5);
    const arrow_offset = Point.direction(
      this.value.x * half_dimensions.x,
      this.value.y * half_dimensions.y
    );
    const value_arrow = new VectorPrimitive(center, center.add(arrow_offset));

    const boundary = new RectPrimitive(
      this.rect.position,
      this.rect.dimensions
    );

    return new GroupPrimitive([boundary, value_arrow], Style.DEFAULT_STROKE);
  }
}
