import { mod } from "../sketchlib/mod.js";

function format_power_term(coefficient, power_str) {
  if (coefficient == 0) {
    return undefined;
  }

  if (coefficient == 1) {
    return power_str;
  }

  return `${coefficient}${power_str}`;
}

function format_constant_term(constant) {
  if (constant == 0) {
    return undefined;
  }

  return `${constant}`;
}

/**
 * Polynomial ax^3 + bx^2 + cx + d where the coefficients
 * and values are evaluated modulo n
 */
export class ModPolynomial {
  constructor(a, b, c, d, modulus) {
    if (modulus < 1) {
      throw new Error("modulus must be a positive integer");
    }

    this.coefficients = [
      mod(a, modulus),
      mod(b, modulus),
      mod(c, modulus),
      mod(d, modulus),
    ];
    this.modulus = modulus;
  }

  compute(x) {
    const n = this.modulus;
    const x2 = mod(x * x, n);
    const x3 = mod(x2 * x, n);

    const [a, b, c, d] = this.coefficients;
    return mod(a * x3 + b * x2 + c * x + d, n);
  }

  orbit(x) {
    const result = [x];
    let current = x;
    for (let i = 0; i < this.modulus; i++) {
      current = this.compute(current);
      if (result.includes(current)) {
        return result;
      }
      result.push(current);
    }

    return result;
  }

  to_string() {
    const [a, b, c, d] = this.coefficients;
    const n = this.modulus;

    const terms = [];
    terms.push(format_power_term(a, "x^3"));
    terms.push(format_power_term(b, "x^2"));
    terms.push(format_power_term(c, "x"));
    terms.push(format_constant_term(d));

    const nonzero_terms = terms.filter((x) => x != undefined);

    if (nonzero_terms.length == 0) {
      return `0 (mod ${n})`;
    }
    return `${nonzero_terms.join(" + ")} (mod ${n})`;
  }
}
