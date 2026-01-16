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
      return;
    }

    const child = this.children.find((x) => x.symbol === symbols[0]);
    if (child) {
      child.insert(symbols.slice(1), value);
    } else {
      // we're starting a new branch in the tree, so make a chain of
      // nodes
      let branch = new Trie(symbols.at(-1), value);
      for (let i = 0; i < symbols.length - 1; i++) {
        branch = new Trie(symbols.at(-2 - i), undefined, [branch]);
      }
      this.children.push(branch);
    }
  }
}
