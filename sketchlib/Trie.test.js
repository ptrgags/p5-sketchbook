import { describe, it, expect } from "vitest";
import { Trie } from "./Trie.js";

describe("Trie", () => {
  describe("insert", () => {
    it("with empty symbols list inserts value at root", () => {
      const trie = new Trie("");
      const value = 4;

      trie.insert([], value);

      const expected = new Trie("", value);
      expect(trie).toEqual(expected);
    });

    it("with single symbol creates one child", () => {
      const trie = new Trie("");
      const value = 4;

      trie.insert(["K"], value);

      const expected = new Trie("", undefined, [new Trie("K", value)]);
      expect(trie).toEqual(expected);
    });
  });
});
