import { describe, it, expect } from "vitest";
import { IntervalStack } from "./IntervalStack.js";
import { M3, P1, P5, P8 } from "./intervals.js";

describe("IntervalStack", () => {
  it("value with index in range returns corresponding interval", () => {
    const stack = new IntervalStack([P1, M3, P5]);

    const result = stack.value(1);

    expect(result).toBe(M3);
  });

  it("value with negative value returns interval in a lower octave", () => {
    const stack = new IntervalStack([P1, M3, P5]);

    const result = stack.value(-4);

    const expected = P5 - 2 * P8;
    expect(result).toBe(expected);
  });

  it("value with value out of range returns interval at a higher octave", () => {
    const stack = new IntervalStack([P1, M3, P5]);

    const result = stack.value(10);

    const expected = M3 + 3 * P8;
    expect(result).toBe(expected);
  });
});
