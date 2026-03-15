import { CVersor } from "../sketchlib/cga2d/CVersor.js";
import { NullPoint } from "../sketchlib/cga2d/NullPoint.js";
import { MouseCallbacks } from "../sketchlib/input/MouseCallbacks.js";
import { MouseInput } from "../sketchlib/input/MouseInput.js";

/**
 * @implements {MouseCallbacks}
 */
export class EllipticCamera {
  /**
   *
   * @param {CVersor} to_screen
   */
  constructor(to_screen) {
    this.to_screen = to_screen;
    this.inv_to_screen = to_screen.inv();

    this.history = CVersor.IDENTITY;

    // The mouse drags out points A -> B
    // we compute the transformations
    // A = elliptic(origin -> A)
    // B = elliptic(origin -> B)
    // the total elliptic transform we want is the one that rotates A to B,
    // i.e. B - A = BA^{-1}
    this.start_to_origin = undefined;
    this.origin_to_end = undefined;
  }

  get transform() {
    if (this.start_to_origin && this.origin_to_end) {
      return this.origin_to_end
        .compose(this.start_to_origin)
        .compose(this.history);
    }

    return this.history;
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_pressed(input) {
    const mouse_point = NullPoint.from_point(input.mouse_coords);
    const start_point = mouse_point.transform(this.inv_to_screen.versor);

    const from_origin = start_point.point.to_direction();

    const direction = from_origin.normalize();
    // TODO: we can use the identities cos(atan(x)), sin(atan(x)) here if we
    // construct the versor manually.
    const angle = 2 * Math.atan(from_origin.mag());
    this.start_to_origin = CVersor.elliptic(direction, angle).inv();
  }

  mouse_moved() {}

  /**
   *
   * @param {MouseInput} input
   */
  mouse_dragged(input) {
    const mouse_point = NullPoint.from_point(input.mouse_coords);
    const end_point = mouse_point.transform(this.inv_to_screen.versor);

    const from_origin = end_point.point.to_direction();

    const direction = from_origin.normalize();
    // TODO: we can use the identities cos(atan(x)), sin(atan(x)) here if we
    // construct the versor manually.
    const angle = 2 * Math.atan(from_origin.mag());
    this.origin_to_end = CVersor.elliptic(direction, angle);
  }

  /**
   *
   * @param {MouseInput} input
   */
  mouse_released(input) {
    // one last update of the origin -> end transform
    this.mouse_dragged(input);

    this.history = this.origin_to_end
      .compose(this.start_to_origin)
      .compose(this.history);

    this.start_to_origin = undefined;
    this.origin_to_end = undefined;
  }
}
