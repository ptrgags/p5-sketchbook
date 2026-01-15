/**
 * @template T
 */
export class Trie {
  /**
   * Constructor
   * @param {string} symbol The symbol for this node
   * @param {T} [value] A value to store in the node
   * @param {Trie[]} [children=[]] Children nodes
   */
  constructor(symbol, value, children = []) {
    this.symbol = symbol;
    this.value = value;
    this.children = children;
  }

  /**
   * Insert a value into the trie, creating new nodes as needed.
   * @param {string[]} symbols Path of symbols to the node that will store the value
   * @param {T} value The value to store
   */
  insert(symbols, value) {
    if (symbols.length === 0) {
      this.value = value;
    }

    const [first, ...rest] = symbols;
    const child = this.children.find((x) => x.symbol === first);
    if (child) {
      child.insert(rest, value);
    } else {
      // we're starting a new branch in the tree, so make a chain of
      // nodes
      let branch = new Trie(rest.at(-1), value);
      for (let i = 0; i < rest.length - 1; i++) {
        branch = new Trie(rest.at(-2 - i), undefined, [branch]);
      }
      this.children.push(branch);
    }
  }
}
