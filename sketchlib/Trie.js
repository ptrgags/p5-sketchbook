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
    throw new Error("not implemented");
  }
}
