import { Line, Point, Direction } from "./objects.js";

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
    if (xy === 0) {
      return new Direction(yo, -xo);
    }

    return new Point(yo / xy, -xo / xy);
  }
}
