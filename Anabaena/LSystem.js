/**
 * Lindenmayer System (aka L-systems) are
 * @see {@link https://algorithmicbotany.org/papers/#abop|The Algorithmic Beauty of Plants} by Prusinkiewicz and Lindenmayer
 */
export class LSystem {
  /**
   * Constructor
   * @param {string} start_symbol The initial symbol.
   * @param {Object.<string, string>} rules Dictionary of symbol (single character string) to substitution string
   */
  constructor(start_symbol, rules) {
    this.start_symbol = start_symbol;
    this.rules = rules;
  }

  /**
   * Perform a string substitution on an arbitrary input string.
   * @param {string} input The input string. This does not have to be derivable from the start symbol
   * @returns {string} The input string after applying the L-system rules one time
   */
  substitute(input) {
    let result = "";
    for (const c of input) {
      const replacement = this.rules[c];
      if (replacement !== undefined) {
        result += replacement;
      } else {
        result += c;
      }
    }

    return result;
  }

  /**
   * Iterate several times at once, returning all the values
   * @param {number} n Nonnegative integer number of substitution iterations
   * @returns {string[]} All the intermediate strings
   */
  iterate(n) {
    const result = [this.start_symbol];
    if (n === 0) {
      return result;
    }

    let current = this.start_symbol;
    for (let i = 1; i <= n; i++) {
      current = this.substitute(current);
      result.push(current);
    }

    return result;
  }
}
