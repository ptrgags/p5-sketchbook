import { describe, it, expect } from "vitest";
import { CGA_MATCHERS } from "../test_helpers/cga_matchers.js";
import { CEven } from "./CEven.js";
import { COdd } from "./COdd.js";

expect.extend(CGA_MATCHERS);

// These tests are checked against the kingdon GA library
// see math-notebook
describe("CEven", () => {
  it("adds even multivectors", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = a.add(b);

    const expected = new CEven(-2, 3, 1, 6, 9, 9, 5, 9);
    expect(result).toBeCEven(expected);
  });

  it("subtracts even multivectors", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = a.sub(b);

    const expected = new CEven(4, 1, 5, 2, 1, 3, 9, 7);
    expect(result).toBeCEven(expected);
  });

  it("computes dual", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.dual();

    const expected = new COdd(4, -3, 2, 1, 4, 3, -2, 1);
    expect(result).toBeCOdd(expected);
  });

  it("dual and antidual are the same in PGA2D", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);

    const a_dual = a.dual();
    const a_antidual = a.antidual();

    expect(a_dual).toBeOdd(a_antidual);
  });

  it("computes reverse", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.reverse();

    const expected = new CEven(1, -2, -3, -4, -5, -6, -7, -8);
    expect(result).toBeCEven(expected);
  });

  it("computes inverse", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.inverse();

    const expected = new CEven(1, -2, -3, -4, 5, 6, 7, 8);
    expect(result).toBeCEven(expected);
  });

  it("sandwich with null bread and even filling returns zero", () => {
    const a = new CEven(0, 0, 0, 0, 0, 0, 0, 0);
    const b = new CEven(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.sandwich(b);

    expect(result).toBeCEven(CEven.ZERO);
  });

  it("sandwich with null bread and odd filling returns zero", () => {
    const a = new CEven(0, 1, 1, 0, 0, 0, 0, 0);
    const b = new COdd(1, 2, 3, 4, 5, 6, 7, 8);

    const result = a.sandwich(b);

    expect(result).toBeCOdd(COdd.ZERO);
  });

  it("computes sandwich with even filling", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = a.sandwich(b);

    const expected = new CEven(-3, 1, 3.6, 4.8, 4, 3, -2, 1);
    expect(result).toBeCEven(expected);
  });

  it("computes sandwich with odd filling", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new COdd(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = a.sandwich(b);

    const expected = new COdd(2.6, 1.8, -12, 2, 4, 3, -2, 1);
    expect(result).toBeCOdd(expected);
  });

  it("lerp with t zero returns first point", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = CEven.lerp(a, b, 0.0);

    expect(result).toBeCEven(a);
  });

  it("lerp with t one returns second point", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = CEven.lerp(a, b, 1.0);

    expect(result).toBeCEven(b);
  });

  it("lerp with t in between interpolates", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = CEven.lerp(a, b, 0.75);

    const expected = new CEven(-2, 1.25, -0.75, 2.5, 4.25, 3.75, 0.25, 2.75);
    expect(result).toBeCEven(expected);
  });

  it("lerp with t negative extrapolates", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = CEven.lerp(a, b, -1);

    const expected = new CEven(5, 3, 8, 6, 6, 9, 16, 15);
    expect(result).toBeCEven(expected);
  });

  it("lerp with t out of bounds extrapolates", () => {
    const a = new CEven(1, 2, 3, 4, 5, 6, 7, 8);
    const b = new CEven(-3, 1, -2, 2, 4, 3, -2, 1);

    const result = CEven.lerp(a, b, 2);

    const expected = new CEven(-7, 0, -7, 0, 3, 0, -11, -6);
    expect(result).toBeCEven(expected);
  });
});
