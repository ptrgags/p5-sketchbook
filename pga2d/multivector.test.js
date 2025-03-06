import { describe, it, expect } from "vitest";
import { Even, Odd } from "./multivectors";
import { PGA_MATCHERS } from "./pga_matchers";

expect.extend(PGA_MATCHERS);

// These tests are checked against the kingdon GA library
describe("Even", () => {
  it("adds even multivectors", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = a.add(b);

    const expected = new Even(-2, 3, 1, 6);
    expect(result).toBeEven(expected);
  });

  it("subtracts even multivectors", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = a.sub(b);

    const expected = new Even(4, 1, 5, 2);
    expect(result).toBeEven(expected);
  });

  it("computes dual", () => {
    const a = new Even(1, 2, 3, 4);

    const result = a.dual();

    const expected = new Odd(4, -3, 2, 1);
    expect(result).toBeOdd(expected);
  });

  it("dual and antidual are the same in PGA2D", () => {
    const a = new Even(1, 2, 3, 4);

    const a_dual = a.dual();
    const a_antidual = a.antidual();

    expect(a_dual).toBeOdd(a_antidual);
  });

  it("computes reverse", () => {
    const a = new Even(1, 2, 3, 4);

    const result = a.reverse();

    const expected = new Even(1, -2, -3, -4);
    expect(result).toBeEven(expected);
  });

  it("computes vee with even multivector", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = a.vee(b);

    const expected = new Odd(-7, 0, 14, 0);
    expect(result).toBeOdd(expected);
  });

  // even vee odd not yet implemented
});
