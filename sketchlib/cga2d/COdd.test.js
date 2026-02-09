import { describe, it, expect } from "vitest";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { COdd } from "./COdd.js";
import { CEven } from "./CEven.js";

expect.extend(CGA_MATCHERS);

describe("COdd", () => {
  it("add computes sum", () => {
    const a = new COdd(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new COdd(-1, 3, 4, 1, 2, -3, 1, -4);

    const result = a.add(b);

    const expected = new COdd(0, 5, 7, 5, 7, 3, 8, 4);
    expect(result).toBeCOdd(expected);
  });

  it("sub computes difference", () => {
    const a = new COdd(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new COdd(-1, 3, 4, 1, 2, -3, 1, -4);

    const result = a.sub(b);

    const expected = new COdd(2, -1, -1, 3, 3, 9, 6, 12);
    expect(result).toBeCOdd(expected);
  });

  it("neg negates all components", () => {
    const a = new COdd(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.neg();

    const expected = new COdd(-1, -2, -3, -4, -5, -6, -7, -8);
    expect(result).toBeCOdd(expected);
  });

  it("computes dual", () => {
    const a = new COdd(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.dual();

    const expected = new CEven(8, 7, 6, 5, 4, 3, -2, 1);
    expect(result).toBeCEven(expected);
  });

  it("antidual is the negative of dual", () => {
    const a = new COdd(1, 2, 3, 4, 5, 6, 7, 8);

    const a_dual = a.dual().neg();
    const a_antidual = a.antidual();

    expect(a_dual).toBeCEven(a_antidual);
  });

  // wedge even is not yet implemented

  it("unit sandwich with null bread and even filling returns zero", () => {
    const a = new COdd(0, 0, 0, 1, 0, 0, 0, 0);
    const b = new CEven(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.unit_sandwich(b);

    expect(result).toBeCEven(CEven.ZERO);
  });

  it("unit sandwich with null bread and odd filling returns zero", () => {
    const a = new COdd(0, 0, 0, 1, 0, 0, 0, 0);
    const b = new COdd(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.unit_sandwich(b);

    expect(result).toBeCOdd(COdd.ZERO);
  });
});
