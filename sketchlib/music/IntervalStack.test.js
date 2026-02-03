import { describe, it, expect } from "vitest";
import { IntervalStack, PitchClassStack, PitchStack } from "./IntervalStack.js";
import { M3, P1, P5, P8 } from "./intervals.js";
import { B, B4, B7, D, D3, G, G4 } from "./pitches.js";

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

describe("PitchClassStack", () => {
  it("value with index in range returns corresponding interval", () => {
    const major = new IntervalStack([P1, M3, P5]);
    const g_major = new PitchClassStack(major, G);

    const result = g_major.value(1);

    expect(result).toBe(B);
  });

  it("value with negative value returns interval in a lower octave", () => {
    const major = new IntervalStack([P1, M3, P5]);
    const g_major = new PitchClassStack(major, G);

    const result = g_major.value(-4);

    expect(result).toBe(D);
  });

  it("value with value out of range returns interval at a higher octave", () => {
    const major = new IntervalStack([P1, M3, P5]);
    const g_major = new PitchClassStack(major, G);

    const result = g_major.value(10);

    expect(result).toBe(B);
  });
});

describe("PitchStack", () => {
  it("value with index in range returns corresponding interval", () => {
    const major = new IntervalStack([P1, M3, P5]);
    const g4_major = new PitchStack(major, G4);

    const result = g4_major.value(1);

    expect(result).toBe(B4);
  });

  it("value with negative value returns interval in a lower octave", () => {
    const major = new IntervalStack([P1, M3, P5]);
    const g4_major = new PitchStack(major, G4);

    const result = g4_major.value(-4);

    const expected = D3;
    expect(result).toBe(expected);
  });

  it("value with value out of range returns interval at a higher octave", () => {
    const major = new IntervalStack([P1, M3, P5]);
    const g4_major = new PitchStack(major, G4);

    const result = g4_major.value(10);

    const expected = B7;
    expect(result).toBe(expected);
  });
});
