function clamp(x, min, max) {
  return Math.max(Math.min(x, max), min);
}

export class Rect {
  constructor(x, y, width, height) {
    this.position = { x, y };
    this.dimensions = { x: width, y: height };
  }

  clamp(point) {
    const { x, y } = point;

    return {
      x: clamp(x, this.position.x, this.position.x + this.dimensions.x),
      y: clamp(y, this.position.y, this.position.y + this.dimensions.y),
    };
  }

  uv_to_world(uv) {
    const { x: u, y: v } = uv;

    return {
      x: this.position.x + u * this.dimensions.x,
      y: this.position.y + (1 - v) * this.dimensions.y,
    };
  }

  world_to_uv(world) {
    const { x, y } = world;

    const u = (x - this.position.x) / this.dimensions.x;
    const v = 1 - (y - this.position.y) / this.dimensions.y;
    return { x: u, y: v };
  }
}
