const SELECT_RADIUS = 8;
const SELECT_RADIUS_SQR = SELECT_RADIUS * SELECT_RADIUS;

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

  move(uv) {
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

  move(uv) {
    const tangent = uv.sub(this.control_point.position);
    this.control_point.tangent = this.constraint.clamp(tangent);
  }
}
