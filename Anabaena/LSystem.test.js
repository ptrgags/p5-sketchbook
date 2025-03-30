import { describe, it, expect } from "vitest";
import { LSystem } from "./LSystem";

// make an L-system that appends the character "." to a string
// every other cycle. I.e.
// a
// b
// a.
// b.
// a..
// b..
// a...
function make_delay_append() {
  const start = "a";
  const rules = {
    a: "b",
    b: "a.",
  };
  return new LSystem(start, rules);
}

describe("LSystem", () => {
  describe("substitute", () => {
    it("symbols not in the rule dict are ignored", () => {
      const system = make_delay_append();
      // only the a is substituted
      const input = "mostly_irrelevant";

      const result = system.substitute(input);

      const expected = "mostly_irrelevbnt";
      expect(result).toBe(expected);
    });

    it("substitutes many symbols at once", () => {
      const system = make_delay_append();
      const input = "abba";

      const result = system.substitute(input);

      const expected = "ba.a.b";
      expect(result).toBe(expected);
    });
  });

  describe("iterate", () => {
    it("with 0 iterations returns start string", () => {
      const system = make_delay_append();

      const result = system.iterate(0);

      const expected = ["a"];
      expect(result).toEqual(expected);
    });

    it("with n iterations returns that number of substituions", () => {
      const system = make_delay_append();

      const result = system.iterate(5);

      const expected = ["a", "b", "a.", "b.", "a..", "b.."];
      expect(result).toEqual(expected);
    });
  });
});
