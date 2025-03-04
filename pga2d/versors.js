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

  transform(object) {
    if (object instanceof Line) {
      const { x: nx, y: ny, o: d } = this.even.sandwich(object.vec);
      return new Line(nx, ny, d);
    }

    // Point
    const { xy, xo, yo } = this.even.sandwich(object.bivec);
    return new Point(xy, xo, yo);
  }
}

export class Flector {
  constructor(odd) {
    this.odd = odd;
  }

  static reflection(line) {
    return new Flector(line.vec);
  }

  transform(object) {
    if (object instanceof Line) {
      const { x: nx, y: ny, o: d } = this.odd.sandwich(object.vec);
      return new Line(nx, ny, d);
    }

    // Point
    const { xy, xo, yo } = this.odd.sandwich(object.bivec);
    return new Point(xy, xo, yo);
  }
}
