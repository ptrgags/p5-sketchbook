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
  constructor(control_point, constraint, tile_quad) {
    this.control_point = control_point;
    this.constraint = constraint;
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

    // If the tangent is facing backwards, negate it to flip it forwards.
    // This is done instead of a reflection so we don't get sudden jumps
    // when the mouse crosses the 90 degree line.
    const flipped_tangent =
      original_tangent.dot(this.constraint) < 0
        ? original_tangent.neg()
        : original_tangent;

    const original_length = original_tangent.magnitude();
    const adjusted_length = Math.min(original_length, MAX_TANGENT_MAGNITUDE);

    const scale_factor = adjusted_length / original_length;
    this.control_point.tangent = flipped_tangent.scale(scale_factor);
  }
}
