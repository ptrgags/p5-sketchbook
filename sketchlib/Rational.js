import { mod } from "./mod.js";

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
 * like Math.sign, but sign_nonzero(0) = 1, not 0.
 * @param {number} x Input number
 * @returns {number} 1 if x is >= 0, -1 otherwise
 */
function sign_nonzero(x) {
  if (x < 0) {
    return -1;
  }

  return 1;
}

/**
 * Rational number a / b stored in lowest terms. For negative fractions,
 * this is normalized so the negative sign is in the numerator
 */
export class Rational {
  /**
   * Constructor
   * @param {number} numerator Integer numerator
   * @param {number} [denominator=1] Integer denominator
   */
  constructor(numerator, denominator = 1) {
    if (numerator === 0 && denominator === 0) {
      throw new Error("cannot divide 0 by 0");
    }

    const a = Math.abs(numerator);
    const b = Math.abs(denominator);
    const sign = sign_nonzero(numerator) * sign_nonzero(denominator);

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
   * Get the reciprocal of this fraction
   * @type {Rational}
   */
  get reciprocal() {
    return new Rational(this.denominator, this.numerator);
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
   * Subtract two rational numbers
   * @param {Rational} other Another rational number
   * @returns {Rational} The difference between the rational numbers
   */
  sub(other) {
    const { numerator: a, denominator: b } = this;
    const { numerator: c, denominator: d } = other;
    const numerator = a * d - b * c;
    const denominator = b * d;

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

    return new Rational(a * c, b * d);
  }

  /**
   * Divide two fractions
   * @param {Rational} other Another rational number
   * @returns {Rational} the division of this / other
   */
  div(other) {
    const { numerator: a, denominator: b } = this;
    const { numerator: c, denominator: d } = other;

    return new Rational(a * d, b * c);
  }

  /**
   * Compute the maximum of two rational numbers
   * @param {Rational} other Another rational number to compare with
   * @returns {Rational} The larger rational number
   */
  max(other) {
    if (this.real >= other.real) {
      return this;
    }

    return other;
  }

  /**
   * Check if two rational numbers are the same number
   * @param {Rational} other The other rational number
   * @returns {boolean} true if the rational numbers are the same
   */
  equals(other) {
    const { numerator: a, denominator: b } = this;
    const { numerator: c, denominator: d } = other;
    // Since numerator/denominator are stored in lowest terms, this is a
    // simple equality test
    return a === c && b === d;
  }
}

Rational.ZERO = Object.freeze(new Rational(0, 1));
Rational.ONE = Object.freeze(new Rational(1, 1));
Rational.INF = Object.freeze(new Rational(1, 0));
Rational.NEG_INF = Object.freeze(new Rational(-1, 0));
