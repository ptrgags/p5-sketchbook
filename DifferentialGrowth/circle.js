import { Rectangle } from "./rectangle.js";

export class Circle {
  constructor(center, radius) {
    this.center = center;
    this.radius = radius;
    this.radius_squared = radius * radius;
  }

  get_bounding_square() {
    const x = this.center.x - this.radius;
    const y = this.center.y - this.radius;
    const w = 2 * this.radius;
    return new Rectangle(x, y, w, w);
  }

  contains(point) {
    const x = point.x - this.center.x;
    const y = point.y - this.center.y;
    const r_sqr = x * x + y * y;

    return r_sqr < this.radius_squared;
  }
}
