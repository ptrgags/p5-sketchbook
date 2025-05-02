import { mod } from "../../sketchlib/mod.js";

/**
 * Greatest common divisor
 * @param {number} a The first number
 * @param {number} b The second number
 * @returns {number} The greatest common divisor
 */
function gcd(a, b) {
  if (b > a) {
    return gcd(b, a);
  }

  if (b === 0) {
    return a;
  }

  return gcd(b, mod(a, b));
}

/**
 * Rational number a / b stored in lowest terms. For negative fractions,
 * this is normalized so the negative sign is in the numerator
 */
export class Rational {
  /**
   * Constructor
   * @param {number} numerator Integer numerator
   * @param {number} denominator Integer denominator
   */
  constructor(numerator, denominator) {
    if (numerator === 0 && denominator === 0) {
      throw new Error("cannot divide 0 by 0");
    }

    const a = Math.abs(numerator);
    const b = Math.abs(denominator);
    const sign = Math.sign(numerator) * Math.sign(denominator);

    const d = gcd(a, b);
    this.numerator = sign * (a / d);
    this.denominator = b / d;
  }

  /**
   * Get the quotient (integer part of numerator/denominator)
   * @type {number}
   */
  get quotient() {
    return Math.floor(this.numerator / this.denominator);
  }

  /**
   * Get the integer remainder of numerator/denominator. This will always
   * be an integer in [0, denominator)
   * @type {number}
   */
  get remainder() {
    return mod(this.numerator, this.denominator);
  }

  /**
   * Convert to a number
   * @type {number}
   */
  get real() {
    return this.numerator / this.denominator;
  }

  /**
   * Add two rational numbers
   * @param {Rational} other Another rational number
   * @returns {Rational} The sum
   */
  add(other) {
    const { numerator: a, denominator: b } = this;
    const { numerator: c, denominator: d } = other;
    const numerator = a * d + b * c;
    const denominator = b * d;

    // The constructor puts the fraction in lowest terms
    return new Rational(numerator, denominator);
  }

  /**
   * Multiply two rational numbers
   * @param {Rational} other Another rational number
   * @returns {Rational} The product
   */
  mul(other) {
    const { numerator: a, denominator: b } = this;
    const { numerator: c, denominator: d } = other;

    return new Rational(a * c, b * c);
  }
}

Rational.ZERO = Object.freeze(new Rational(0, 1));
Rational.INF = Object.freeze(new Rational(1, 0));
Rational.NEG_INF = Object.freeze(new Rational(-1, 0));
