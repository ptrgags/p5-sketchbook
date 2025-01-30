import { scale } from "./vector.js";

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

  /**
   * Subdivide into a n x n grid of smaller quads
   * @param {number} n the number of divisions on a side
   * @returns {Rect[]} The sub-tiles
   */
  subdivide_grid(n) {
    const result = new Array(n * n);
    const sub_dimensions = scale(1 / n, this.dimensions);
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
