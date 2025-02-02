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

  sandwich_even(other) {
    const { x, y, o } = this;
    const { scalar, xy: p, xo: q, yo: r } = other;

    // TODO: this doesn't include the pseudoscalar xyo in the bread yet.

    // Sandwich is linear over the filling, so
    // A(s + B)A^-1 = sAA^-1 + ABA^-1 = s + ABA^-1
    // so the original scalar passes through unchanged. As for the rest...

    // ABA^-1 = A(Pxy + Qxo + Ryo)A^-1 = PAxyA^-1 + QAxoA^-1 + RAyoA^-1

    // AxyA^-1 = (ax + by + co)xy(ax + by + co)
    //         = (ay - bx + cxyo)(ax + by + co)
    //         = (-a^2xy + ab + acyo) - (ab + b^2xy + bcxo) + (acyo - bcxo + 0)
    //         = 0 - (a^2 + b^2)xy + 2acyo - 2bcxo

    // AxoA^-1 = (ax + by + co)xo(ax + by + co)
    //         = (ao - bxyo + 0)(ax + by + co)
    //         = (-a^2xo - abyo + 0 -abxy + b^2xo + 0)
    //         = -abxy -abyo + (b^2 - a^2)xo

    // AyoA^-1 = (ax + by + co)yo(ax + by + co)
    //         = (axyo + bo + 0)(ax + by + co)
    //         = (a^2yo - abxo + 0 - abxo - b^2yo + 0)
    //         = -2abxo + (a^2 - b^2)yo

    // adding things up we have
    // (-P(a^2 + b^2) - Qab)xy + (-2Pbc + Q(b^2 - a^2) - 2Rab)xo + (2Pac - Qab + R(a^2 - b^2))yo
    const a_sqr = x * x;
    const b_sqr = y * y;
    const ab = x * y;
    const bc = y * o;
    const ac = x * o;
    const scalar_part = scalar;
    const xy_part = -p * (a_sqr + b_sqr) - q * ab;
    const xo_part = -2 * p * bc + q * (b_sqr - a_sqr) - 2 * r * ab;
    const yo_part = 2 * p * ac - q * ab - r * (a_sqr - b_sqr);

    return new Even(scalar_part, xy_part, xo_part, yo_part);
  }

  sandwich_odd(other) {
    throw new Error("Not Implemented");
  }

  sandwich(other) {
    if (other instanceof Odd) {
      return this.sandwich_odd(other);
    }

    return this.sandwich_even(other);
  }
}
