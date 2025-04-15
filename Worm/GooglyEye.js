import { Point } from "../pga2d/objects.js";
import { CirclePrimitive, GroupPrimitive } from "../sketchlib/primitives.js";
import { Color, Style } from "../sketchlib/Style.js";

const STYLE_SCLERA = new Style({ fill: Color.WHITE });
const STYLE_PUPIL = new Style({ fill: Color.BLACK });

export class GooglyEye {
  constructor(position, look_direction, sclera_radius, pupil_radius) {
    this.position = position;
    this.look_direction = look_direction;
    this.sclera_radius = sclera_radius;
    this.pupil_radius = pupil_radius;

    this.geometry = this.compute_geometry();
  }

  /**
   * Update the position and look direction
   * @param {Point} position The new position of the eye
   * @param {Point} look_direction The direction to look in. This must be normalized
   */
  update(position, look_direction) {
    this.position = position;
    this.look_direction = look_direction;

    this.geometry = this.compute_geometry();
  }

  compute_geometry() {
    // The sclera is easy, just draw a filled circle
    const sclera_circle = new CirclePrimitive(
      this.position,
      this.sclera_radius
    );
    const sclera = new GroupPrimitive([sclera_circle], STYLE_SCLERA);

    const pupil_center = this.position.add(
      this.look_direction.scale(this.sclera_radius - this.pupil_radius)
    );
    const pupil_circle = new CirclePrimitive(pupil_center, this.pupil_radius);
    const pupil = new GroupPrimitive([pupil_circle], STYLE_PUPIL);

    return new GroupPrimitive([sclera, pupil]);
  }

  render() {
    return this.geometry;
  }
}
