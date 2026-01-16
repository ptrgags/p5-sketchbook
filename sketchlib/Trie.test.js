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

    it("with several symbols creates a chain of nodes", () => {
      const trie = new Trie("");
      const value = 4;

      trie.insert(["K", "E", "Y"], value);

      const expected = new Trie("", undefined, [
        new Trie("K", undefined, [
          new Trie("E", undefined, [new Trie("Y", value)]),
        ]),
      ]);
      expect(trie).toEqual(expected);
    });

    it("with repeated keyword overwrites value", () => {
      const trie = new Trie("");
      const answer = 0;
      const ultimate_answer = 42;

      trie.insert(["K", "E", "Y"], answer);
      trie.insert(["K", "E", "Y"], ultimate_answer);

      const expected = new Trie("", undefined, [
        new Trie("K", undefined, [
          new Trie("E", undefined, [new Trie("Y", ultimate_answer)]),
        ]),
      ]);
      expect(trie).toEqual(expected);
    });

    it("with prefix of existing word sets a value without creating nodes", () => {
      const trie = new Trie("");
      const keyword = "trie";
      const key = "skeleton";

      trie.insert(["K", "E", "Y", "W", "O", "R", "D"], keyword);
      trie.insert(["K", "E", "Y"], key);

      const expected = new Trie("", undefined, [
        new Trie("K", undefined, [
          new Trie("E", undefined, [
            new Trie("Y", key, [
              new Trie("W", undefined, [
                new Trie("O", undefined, [
                  new Trie("R", undefined, [new Trie("D", keyword)]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]);
      expect(trie).toEqual(expected);
    });

    it("with unrelated keywords branches at the root", () => {
      const trie = new Trie("");

      trie.insert(["A", "P", "P"], "apple");
      trie.insert(["B", "A", "N"], "banana");

      const expected = new Trie("", undefined, [
        new Trie("A", undefined, [
          new Trie("P", undefined, [new Trie("P", "apple")]),
        ]),
        new Trie("B", undefined, [
          new Trie("A", undefined, [new Trie("N", "banana")]),
        ]),
      ]);
      expect(trie).toEqual(expected);
    });

    it("with keywords that share a prefix, branches after prefix", () => {
      const trie = new Trie("");

      trie.insert(["P", "A", "I", "R"], "pair");
      trie.insert(["P", "A", "R", "E"], "pare");

      const expected = new Trie("", undefined, [
        new Trie("P", undefined, [
          new Trie("A", undefined, [
            new Trie("I", undefined, [new Trie("R", "pair")]),
            new Trie("R", undefined, [new Trie("E", "pare")]),
          ]),
        ]),
      ]);
      expect(trie).toEqual(expected);
    });
  });
});
