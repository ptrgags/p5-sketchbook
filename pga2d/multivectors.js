import { is_nearly } from "../sketchlib/is_nearly.js";

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

  // in 2D PGA, the antidual has exactly the same signs as the dual
  // so we get this function for free!
  antidual = this.dual;

  vee_even(other) {
    // a v b = antidual(dual(a) ^ dual(b))
    const a_dual = this.dual();
    const b_dual = other.dual();
    return a_dual.wedge(b_dual).dual();
  }

  vee_odd(other) {
    throw new Error("Not implemented");
  }

  vee(other) {
    if (other instanceof Even) {
      return this.vee_even(other);
    }

    return this.vee_odd(other);
  }

  equals(other) {
    return (
      is_nearly(this.scalar, other.scalar) &&
      is_nearly(this.xy, other.xy) &&
      is_nearly(this.xo, other.xo) &&
      is_nearly(this.yo, other.yo)
    );
  }

  static lerp(a, b, t) {
    const s = 1 - t;

    const scalar = s * a.scalar + t * b.scalar;
    const xy = s * a.xy + t * b.xy;
    const xo = s * a.xo + t * b.xo;
    const yo = s * a.yo + t * b.yo;

    return new Even(scalar, xy, xo, yo);
  }
}
Even.ZERO = Object.freeze(new Even(0, 0, 0, 0));
Even.IDENTITY = Object.freeze(new Even(1, 0, 0, 0));

export class Odd {
  constructor(x, y, o, xyo) {
    this.x = x;
    this.y = y;
    this.o = o;
    this.xyo = xyo;
  }

  norm() {
    return this.x * this.x + this.y * this.y;
  }

  sandwich_even(other) {
    const { x, y, o, xyo } = this;
    const { scalar, xy, xo, yo } = other;

    // if the bread is a null vector, the result will be zero
    const mag_sqr = x * x + y * y;
    if (is_nearly(mag_sqr, 0)) {
      return Even.ZERO;
    }

    // EDIT: In the derivation below, I'm forgetting to account for the
    // negative sign for rev(xyo)... I'll revisit this later.
    //
    // let A = (ax + by + co + dxyo)
    //  A^-1 = rev(A) / A^2 = (ax + by + co - dxyo)/A^2
    //     B = (A + Bxy + Cxo + Dyo)
    //
    //  ABA^-1 = 1/A^2 (AB rev(A))
    //
    // so we can pull the scalar 1/A^2 out of the product and handle it at the end
    //
    // The sandwich product splits into "symmetrical" terms like (ax)B(ax) and
    // pairs of asymmetrical terms like (ax)B(by) + (by)B(ax). We'll treat
    // each one separately.
    //
    // For symmetrical terms, note that if the bread has a null vector in it
    // (co and dxyo terms), the result will be 0 since the inner product will
    // be invoked. So we only have to look at ax and by.
    //
    // Furthermore, the trick is to look for how many basis vectors overlap
    // in a blade sandwich. If it's even, the result is commutative so the
    // sign will be positive. If it's odd, the result is anticommutative so
    // the sign will be negative. So we have:
    //
    // (ax)B(ax) = a^2(xBx) = a^2(A - Bxy - Cxo + Dyo)
    // (by)B(by) = b^2(yBy) = b^2(A - Bxy + Cxo - Dyo)
    //
    // Now what about the asymmetrical sandwiches like (ax)B(by) + (by)B(ax)?
    // First, the scalars can be pulled out: (ab)(xBy + yBx)
    // Each term T of B will either commute or anticommute with x, and this is
    // independent of the anticommutativity with y.
    //
    // There are four possibilities of sign when we commute T with one of the
    // blades:
    //
    // T and x | T and y | xTy + yTx
    // --------|---------|-----------------------------
    //    +    |    +    |  Txy + Tyx = T(xy - xy) = 0
    //    +    |    -    |  Txy - Tyx = 2T(xy)
    //    -    |    +    | -Txy + Tyx = -2T(xy)
    //    -    |    -    | -Txy - Tyx = T(-xy + xy) = 0
    //
    // So terms that fully commute or anti-commute will cancel out. We only
    // need to consider terms that commute with one of the pieces of bread but
    // not the other. Also note that what's left will always have a coefficient
    // of 2 out front.
    //
    // Also remember that this is a degenerate algebra, so any term with two
    // copies of the null vector will become zero regardless of commutativity.
    //
    // Also note that since we are multiplying odd and even grades,
    // even overlaps commute, odd overlaps anticommute.
    //
    // [ax/B/by]   = 2ab(0 + 0 - (Cxo)xy + (Dyo)xy) = 2ab(-Cyo - Dxo)
    // [ax/B/co]   = 2ac(0 - (Bxy)xo + 0 + 0) = 2ac(Byo)
    // [ax/B/dxyo] = 2ad(0 - (Bxy)(x)(xyo) + 0 + 0) = 2ad(Bxo)
    // [by/B/co]   = 2bc(0 - (Bxy)yo + 0 + 0) = 2bc(-Bxo)
    // [by/B/dxyo] = 2bd(0 - (Bxy)(y)(xyo) + 0 + 0) = 2bd(-Byo)
    // [co/B/dxyo] = 0 (two null vectors)
    //
    // Let's gather up terms by component
    // scalar: a^2A + b^2A = (a^2 + b^2)A
    // xy: -a^2 B -b^2 B = -(a^2 + b^2)B
    // xo: -a^2 C + b^2 C -2ab D + 2ad B - 2bc B = (b^2 - a^2)C -(2ab)D + 2(ad - bc)B
    // yo: a^2 D - b^2 D -2ab C + 2ac B - 2bd B = (a^2 - b^2)D -(2ab)C + 2(ac - bd)B
    //
    // Remember that we have to divide by A^2 = (a^2 + b^2) at the end!

    const a_sqr = x * x;
    const b_sqr = y * y;
    const ab = x * y;
    const ac = x * o;
    const ad = x * xyo;
    const bc = y * o;
    const bd = y * xyo;

    // The scalar term is A^3/A^2 = A
    const scalar_part = scalar;

    // the xy term is -A^2/A^2 B = -B
    const xy_part = -xy;
    const xo_part = (b_sqr - a_sqr) * xo - 2 * ab * yo + 2 * (ad - bc) * xy;
    const yo_part = (a_sqr - b_sqr) * yo - 2 * ab * xo + 2 * (ac - bd) * xy;

    return new Even(scalar_part, xy_part, xo_part / mag_sqr, yo_part / mag_sqr);
  }

  wedge_odd(other) {
    // Note that the pseudoscalar part xyo will always wedge to 0, so we can
    // ignore it.
    const { x: ax, y: ay, o: ao } = this;
    const { x: bx, y: by, o: bo } = other;

    const xy_part = ax * by - ay * bx;
    const xo_part = ax * bo - ao * bx;
    const yo_part = ay * bo - ao * by;

    return new Even(0, xy_part, xo_part, yo_part);
  }

  wedge_even(other) {
    throw new Error("Not Implemented");
  }

  wedge(other) {
    if (other instanceof Odd) {
      return this.wedge_odd(other);
    }

    return this.wedge_even(other);
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

  equals(other) {
    return (
      is_nearly(this.x, other.x) &&
      is_nearly(this.y, other.y) &&
      is_nearly(this.o, other.o) &&
      is_nearly(this.xyo, other.xyo)
    );
  }
}
