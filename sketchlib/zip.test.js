import { describe, it, expect } from "vitest";
import { zip } from "./zip.js";

describe("zip", () => {
  it("with mismatched array lengths throws error", () => {
    const a = [1, 2, 3, 4];
    const b = [4, 3];

    expect(() => {
      return zip(a, b);
    }).toThrowError("array lengths must match");
  });

  it("zips parallel arrays into tuples", () => {
    const a = [1, 2, 3, 4];
    const b = ["strawberry", "apple", "cherry", "passionfruit"];

    const result = zip(a, b);

    const expected = [
      [1, "strawberry"],
      [2, "apple"],
      [3, "cherry"],
      [4, "passionfruit"],
    ];
    expect(result).toEqual(expected);
  });
});
