export class Even {
  constructor(scalar, xy, xo, yo) {
    this.scalar = scalar;
    this.xy = xy;
    this.xo = xo;
    this.yo = yo;
  }

  add(other) {
    const scalar = this.scalar + other.scalar;
    const xy = this.xy + other.xy;
    const xo = this.xo + other.xo;
    const yo = this.yo + other.yo;
    return new Even(scalar, xy, xo, yo);
  }

  sub(other) {
    const scalar = this.scalar - other.scalar;
    const xy = this.xy - other.xy;
    const xo = this.xo - other.xo;
    const yo = this.yo - other.yo;
    return new Even(scalar, xy, xo, yo);
  }

  dual() {
    return new Odd(this.yo, -this.xo, this.xy, this.scalar);
  }
}
Even.IDENTITY = Object.freeze(new Even(1, 0, 0, 0));

export class Odd {
  constructor(x, y, o, xyo) {
    this.x = x;
    this.y = y;
    this.o = o;
    this.xyo = xyo;
  }
}
