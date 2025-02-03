import { Flector } from "../pga2d/versors.js";

export const SELECT_RADIUS = 8;
const SELECT_RADIUS_SQR = SELECT_RADIUS * SELECT_RADIUS;
const MAX_TANGENT_MAGNITUDE = 0.5;

export class InteractiveVertex {
  constructor(control_point, constraint, tile_quad) {
    this.control_point = control_point;
    this.constraint = constraint;
    this.tile_quad = tile_quad;
  }

  get position_world() {
    return this.tile_quad.uv_to_world(this.control_point.position);
  }

  is_hovering(mouse) {
    const position_world = this.tile_quad.uv_to_world(
      this.control_point.position
    );
    const dist_sqr = mouse.dist_sqr(position_world);

    return dist_sqr < SELECT_RADIUS_SQR;
  }

  move(mouse) {
    const uv = this.tile_quad.world_to_uv(mouse);
    this.control_point.position = this.constraint.clamp(uv);
  }
}

export class InteractiveTangent {
  constructor(control_point, forward_direction, tile_quad) {
    // The forward direction serves as a constraint so we never have
    // a backwards-pointing tangent. To reflect a point forward, we need
    // the reflection in the line orthogonal to the forward direction
    this.forward_direction = forward_direction;
    const dual_line = forward_direction.dual();

    this.flip_forward = Flector.reflection(dual_line);

    this.control_point = control_point;
    this.tile_quad = tile_quad;
  }

  get position_world() {
    return this.tile_quad.uv_to_world(this.control_point.forward_point);
  }

  is_hovering(mouse) {
    const position_world = this.tile_quad.uv_to_world(
      this.control_point.forward_point
    );
    const dist_sqr = mouse.dist_sqr(position_world);

    return dist_sqr < SELECT_RADIUS_SQR;
  }

  move(mouse) {
    const uv = this.tile_quad.world_to_uv(mouse);
    const original_tangent = uv.sub(this.control_point.position);

    // If the tangent is facing backwards, reflect it so it's facing forwards
    const corrected_tangent =
      original_tangent.dot(this.forward_direction) < 0
        ? // Since directions are represented as ideal points (bivectors)
          // not vectors, you get a negative sign which is unwanted here. Hence
          // the .neg()
          this.flip_forward.transform(original_tangent).neg()
        : original_tangent;

    const original_length = original_tangent.ideal_mag();
    const adjusted_length = Math.min(original_length, MAX_TANGENT_MAGNITUDE);

    const scale_factor = adjusted_length / original_length;
    this.control_point.tangent = corrected_tangent.scale(scale_factor);
  }
}
