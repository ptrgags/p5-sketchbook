import { describe, it, expect } from "vitest";
import { CVersor } from "./CVersor.js";
import { Direction } from "../pga2d/Direction.js";
import { PowerIterator } from "./PowerIterator.js";
import { expect_arrays } from "../test_helpers/expect_arrays.js";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";

expect.extend(CGA_MATCHERS);

function expect_versors(result, expected) {
  expect(result).toBeCVersor(expected);
}

describe("PowerIterator", () => {
  it("with backwards range returns empty array", () => {
    const translate = CVersor.translation(Direction.DIR_X);
    const iterator = new PowerIterator(translate);

    const result = iterator.iterate(10, -10);

    const expected = [];
    expect(result).toEqual(expected);
  });

  it("with min_power equal to max_power returns that power", () => {
    const translate = CVersor.translation(Direction.DIR_X);
    const iterator = new PowerIterator(translate);

    const result = iterator.iterate(5, 5);

    // T(d)^5 = T(5d)
    const expected = [CVersor.translation(Direction.DIR_X.scale(5))];
    expect_arrays(result, expected, expect_versors);
  });

  it("with powers both set to 0 returns identity", () => {
    const translate = CVersor.translation(Direction.DIR_X);
    const iterator = new PowerIterator(translate);

    const result = iterator.iterate(0, 0);

    const expected = [CVersor.IDENTITY];
    expect_arrays(result, expected, expect_versors);
  });

  it("with range starting at 0 returns identity and powers", () => {
    const translate = CVersor.translation(Direction.DIR_X);
    const iterator = new PowerIterator(translate);

    const result = iterator.iterate(0, 3);

    const expected = [
      CVersor.IDENTITY,
      translate,
      CVersor.translation(Direction.DIR_X.scale(2)),
      CVersor.translation(Direction.DIR_X.scale(3)),
    ];
    expect_arrays(result, expected, expect_versors);
  });

  it("with range of negative powers returns powers of inverse in the correct order", () => {
    const translate = CVersor.translation(Direction.DIR_X);
    const iterator = new PowerIterator(translate);

    const result = iterator.iterate(-2, 0);

    const expected = [
      CVersor.translation(Direction.DIR_X.scale(-2)),
      CVersor.translation(Direction.DIR_X.scale(-1)),
      CVersor.IDENTITY,
    ];
    expect_arrays(result, expected, expect_versors);
  });

  it("with range from negative to positive powers returns correct versors", () => {
    const translate = CVersor.translation(Direction.DIR_X);
    const iterator = new PowerIterator(translate);

    const result = iterator.iterate(-2, 3);

    const expected = [
      CVersor.translation(Direction.DIR_X.scale(-2)),
      CVersor.translation(Direction.DIR_X.scale(-1)),
      CVersor.IDENTITY,
      translate,
      CVersor.translation(Direction.DIR_X.scale(2)),
      CVersor.translation(Direction.DIR_X.scale(3)),
    ];
    expect_arrays(result, expected, expect_versors);
  });
});
