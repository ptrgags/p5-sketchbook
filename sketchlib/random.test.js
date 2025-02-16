import { describe, it, expect } from "vitest";
import { Random } from "./random";

describe("Random", () => {
  it("rand_int returns numbers in a half open range", () => {
    const N = 50;
    const MIN = 3;
    const MAX = 4;

    const results = new Array(N)
      .fill(0)
      .map((_, i) => Random.rand_int(MIN, MAX));
    const results_in_range = results.every((x) => x >= MIN && x <= MAX);

    expect(results_in_range).toBe(true);
  });

  it("shuffle makes a copy of the array", () => {
    const array = [1, 2, 3, 4, 5];
    const array_copy = [...array];

    const result = Random.shuffle(array);

    expect(array).toEqual(array_copy);
    expect(result).not.toBe(array);
  });

  it("shuffle returns array of same length", () => {
    const array = [1, 2, 3, 4];

    const results = Random.shuffle(array);

    expect(results.length).toBe(4);
  });
});
