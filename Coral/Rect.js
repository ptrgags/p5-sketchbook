import { Direction, Point } from "../pga2d/objects.js";

function clamp(x, min, max) {
  return Math.max(Math.min(x, max), min);
}

export class Rect {
  constructor(x, y, width, height) {
    this.position = new Point(x, y);
    this.dimensions = new Direction(width, height);
  }

  get far_corner() {
    return this.position.add(this.dimensions);
  }

  clamp(point) {
    const { x, y } = point;
    const { x: near_x, y: near_y } = this.position;
    const { x: far_x, y: far_y } = this.far_corner;

    return new Point(clamp(x, near_x, far_x), clamp(y, near_y, far_y));
  }

  uv_to_world(uv) {
    const { x: u, y: v } = uv;

    return new Point(
      this.position.x + u * this.dimensions.x,
      this.position.y + (1 - v) * this.dimensions.y
    );
  }

  world_to_uv(world) {
    const { x, y } = world;

    const u = (x - this.position.x) / this.dimensions.x;
    const v = 1 - (y - this.position.y) / this.dimensions.y;
    return new Point(u, v);
  }

  /**
   * Subdivide into a n x n grid of smaller quads
   * @param {number} n the number of divisions on a side
   * @returns {Rect[]} The sub-tiles
   */
  subdivide_grid(n) {
    const result = new Array(n * n);
    const sub_dimensions = this.dimensions.scale(1 / n);
    for (let i = 0; i < n; i++) {
      const y = this.position.y + i * sub_dimensions.y;
      for (let j = 0; j < n; j++) {
        const x = this.position.x + j * sub_dimensions.x;
        result[i * n + j] = new Rect(x, y, sub_dimensions.x, sub_dimensions.y);
      }
    }

    return result;
  }
}
