import { xform } from "./primitives/shorthand.js";
import { Trie } from "./Trie.js";

export class KeywordRecognizer {
  constructor() {
    /**
     * @type {Trie<function():void>}
     */
    this.trie = new Trie("");
    this.cursor = this.trie;
  }

  /**
   * Register a keyword and callback
   * @param {string[]} keyword array of input symbols (e.g. key codes)
   * @param {function(): void} callback Function to call every time the keyword is recognized
   */
  register(keyword, callback) {
    this.trie.insert(keyword, callback);
  }

  /**
   * Input the next key or other input symbol
   * @param {string} symbol Next input symbol (e.g. a keyboard code)
   */
  input(symbol) {
    const next_node = this.cursor.children.find((x) => x.symbol === symbol);
    if (next_node) {
      // advance the cursor, triggering a callback if needed
      this.cursor = next_node;
      if (this.cursor.value) {
        this.cursor.value();
      }
    } else if (this.cursor !== this.trie) {
      // We diverged from the path.
      // Go back to the beginning and retry once
      this.cursor = this.trie;
      this.input(symbol);
    }

    // bad symbol at the root, just ignore it
  }
}
