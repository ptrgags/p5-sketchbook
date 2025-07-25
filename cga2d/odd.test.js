import { describe, it, expect } from "vitest";
import { CGAOdd } from "./odd";

describe("CGAOdd", () => {
  describe("plane reflections", () => {
    it("x flips the x component", () => {
      const x = CGAOdd.vector(1, 0, 0, 0);
      const other_vec = CGAOdd.vector(2, 3, 4, 5);

      const result = x.sandwich_odd(other_vec);

      const expected = CGAOdd.vector(-2, 3, 4, 5);
      expect(result).toEqual(expected);
    });

    it("y flips the y component", () => {
      const y = CGAOdd.vector(0, 1, 0, 0);
      const other_vec = CGAOdd.vector(2, 3, 4, 5);

      const result = y.sandwich_odd(other_vec);

      const expected = CGAOdd.vector(2, -3, 4, 5);
      expect(result).toEqual(expected);
    });

    it("p flips the p component", () => {
      const p = CGAOdd.vector(0, 0, 1, 0);
      const other_vec = CGAOdd.vector(2, 3, 4, 5);

      const result = p.sandwich_odd(other_vec);

      const expected = CGAOdd.vector(2, 3, -4, 5);
      expect(result).toEqual(expected);
    });

    it("n flips the n component", () => {
      const n = CGAOdd.vector(0, 0, 0, 1);
      const other_vec = CGAOdd.vector(2, 3, 4, 5);

      const result = n.sandwich_odd(other_vec);

      const expected = CGAOdd.vector(2, 3, 4, -5);
      expect(result).toEqual(expected);
    });
  });
});
