import { describe, it, expect } from "vitest";
import { Even, Odd } from "./multivectors";
import { PGA_MATCHERS } from "../test_helpers/pga_matchers";

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

    const result = a.vee_even(b);

    const expected = new Odd(-7, 0, 14, 0);
    expect(result).toBeOdd(expected);
  });

  // even vee odd not yet implemented

  it("sandwich with null bread and even filling returns zero", () => {
    const a = new Even(0, 0, 1, 0);
    const b = new Even(1, 2, 3, 4);

    const result = a.sandwich(b);

    expect(result).toBeEven(Even.ZERO);
  });

  it("sandwich with null bread and odd filling returns zero", () => {
    const a = new Even(0, 0, 1, 0);
    const b = new Odd(1, 2, 3, 4);

    const result = a.sandwich(b);

    expect(result).toBeOdd(Odd.ZERO);
  });

  it("computes sandwich with even filling", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = a.sandwich(b);

    const expected = new Even(-3, 1, 3.6, 4.8);
    expect(result).toBeEven(expected);
  });

  it("computes sandwich with odd filling", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Odd(-3, 1, -2, 2);

    const result = a.sandwich(b);

    const expected = new Odd(2.6, 1.8, -12, 2);
    expect(result).toBeOdd(expected);
  });

  it("lerp with t zero returns first point", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = Even.lerp(a, b, 0.0);

    expect(result).toBeEven(a);
  });

  it("lerp with t one returns second point", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = Even.lerp(a, b, 1.0);

    expect(result).toBeEven(b);
  });

  it("lerp with t in between interpolates", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = Even.lerp(a, b, 0.75);

    const expected = new Even(-2, 1.25, -0.75, 2.5);
    expect(result).toBeEven(expected);
  });

  it("lerp with t negative extrapolates", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = Even.lerp(a, b, -1);

    const expected = new Even(5, 3, 8, 6);
    expect(result).toBeEven(expected);
  });

  it("lerp with t out of bounds extrapolates", () => {
    const a = new Even(1, 2, 3, 4);
    const b = new Even(-3, 1, -2, 2);

    const result = Even.lerp(a, b, 2);

    const expected = new Even(-7, 0, -7, 0);
    expect(result).toBeEven(expected);
  });
});

describe("Odd", () => {
  it("add computes sum", () => {
    const a = new Odd(1, 2, 3, 4);
    const b = new Odd(-1, 3, 4, 1);

    const result = a.add(b);

    const expected = new Odd(0, 5, 7, 5);
    expect(result).toBeOdd(expected);
  });

  it("sub computes difference", () => {
    const a = new Odd(1, 2, 3, 4);
    const b = new Odd(-1, 3, 4, 1);

    const result = a.sub(b);

    const expected = new Odd(2, -1, -1, 3);
    expect(result).toBeOdd(expected);
  });

  it("neg negates all components", () => {
    const a = new Odd(1, 2, 3, 4);

    const result = a.neg();

    const expected = new Odd(-1, -2, -3, -4);
    expect(result).toBeOdd(expected);
  });

  it("computes dual", () => {
    const a = new Odd(1, 2, 3, 4);

    const result = a.dual();

    const expected = new Even(4, 3, -2, 1);
    expect(result).toBeEven(expected);
  });

  it("antidual is the same as dual", () => {
    const a = new Odd(1, 2, 3, 4);

    const a_dual = a.dual();
    const a_antidual = a.antidual();

    expect(a_dual).toBeEven(a_antidual);
  });

  it("computes dot product", () => {
    const a = new Odd(1, 2, 3, 4);
    const b = new Odd(-1, 3, 4, 1);

    const result = a.dot(b);

    const expected = 5;
    expect(result).toBe(expected);
  });

  it("computes wedge with odd multivector", () => {
    const a = new Odd(1, 2, 3, 4);
    const b = new Odd(-2, 1, 3, -1);

    const result = a.wedge_odd(b);

    const expected = new Even(0, 5, 9, 3);
    expect(result).toBeEven(expected);
  });

  // wedge even is not yet implemented

  it("sandwich with null bread and even filling returns zero", () => {
    const a = new Odd(0, 0, 0, 1);
    const b = new Even(1, 2, 3, 4);

    const result = a.sandwich(b);

    expect(result).toBeEven(Even.ZERO);
  });

  it("sandwich with null bread and odd filling returns zero", () => {
    const a = new Odd(0, 0, 0, 1);
    const b = new Odd(1, 2, 3, 4);

    const result = a.sandwich(b);

    expect(result).toBeOdd(Odd.ZERO);
  });
});
