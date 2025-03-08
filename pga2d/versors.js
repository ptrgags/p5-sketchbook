import { Even, Odd } from "./multivectors.js";
import { Line, Point } from "./objects.js";

export class Motor {
  constructor(even) {
    this.even = even;
  }

  reverse() {
    return new Motor(this.even.reverse());
  }

  static rotation(point, angle) {
    const c = Math.cos(angle / 2);
    const s = Math.sin(angle / 2);
    const { x, y } = point;
    return new Motor(new Even(c, s, s * y, s * x));
  }

  transform_line(object) {
    const { x: nx, y: ny, o: d } = this.even.sandwich(object.vec);
    return new Line(nx, ny, d);
  }

  transform_point(object) {
    const { xy, xo, yo } = this.even.sandwich(object.bivec);
    return new Point(xy, xo, yo);
  }

  toString() {
    return `Motor(${this.even})`;
  }
}

export class Flector {
  /**
   * Constructor
   * @param {Odd} odd The underlying odd object
   */
  constructor(odd) {
    this.odd = odd;
  }

  static reflection(line) {
    return new Flector(line.vec);
  }

  /**
   * @param {Odd} odd
   * @returns {Odd} The transformed odd object
   */
  transform_odd(odd) {
    return this.odd.sandwich_odd(odd);
  }

  /**
   * @param {Line} line
   * @returns {Line} The new line
   */
  transform_line(line) {
    const vec = this.odd.sandwich_odd(line.vec);
    return Line.from_vec(vec);
  }

  transform_point(point) {
    // Point
    const bivec = this.odd.sandwich_even(point.bivec);
    return Point.from_bivec(bivec);
  }

  toString() {
    return `Flector(${this.odd})`;
  }
}
