import { Line } from "./objects.js";

export class Flector {
  constructor(odd) {
    this.odd = odd;
  }

  static reflection(line) {
    return new Flector(line.vec);
  }

  transform(object) {
    if (object instanceof Line) {
      return this.odd.sandwich(object.vec);
    }

    // Point
    return this.odd.sandwich(object.bivec);
  }
}
