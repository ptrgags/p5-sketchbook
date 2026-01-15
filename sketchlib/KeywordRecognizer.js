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
    throw new Error("not implemented");
  }

  /**
   * Input the next key or other input symbol
   * @param {string} symbol Next input symbol (e.g. a keyboard code)
   */
  input(symbol) {
    throw new Error("not implemented");
  }
}
