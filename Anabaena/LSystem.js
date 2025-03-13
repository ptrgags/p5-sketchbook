export class LSystem {
  constructor(start_symbol, rules) {
    this.start_symbol = start_symbol;
    this.rules = rules;
  }

  substitute(string) {
    let result = "";
    for (const c of string) {
      const replacement = this.rules[c];
      if (replacement !== undefined) {
        result += replacement;
      } else {
        result += c;
      }
    }

    return result;
  }

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
