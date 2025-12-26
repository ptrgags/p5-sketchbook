import { describe, it, expect } from "vitest";
import { whole_fract } from "./whole_fract";

describe("whole_fract", () => {
  it("with 0 gives 0, 0", () => {
    const result = whole_fract(0.0);

    expect(result).toEqual([0, 0.0]);
  });

  it("with positive integer x gives x, 0", () => {
    const result = whole_fract(2.0);

    expect(result).toEqual([2, 0.0]);
  });

  it("with positive real number gives integer and fractional parts", () => {
    const result = whole_fract(8.375);

    expect(result).toEqual([8, 0.375]);
  });

  it("with negative integer gives correct value", () => {
    const [whole, fract] = whole_fract(-1.0);

    // Jest treats 0.0 and -0.0 differently. annoying...
    expect(whole).toBe(-1);
    // Jest treats 0.0 and -0.0 differently. I've yet to see a case where
    // this distinction is helpful.
    expect(fract === 0).toBe(true);
  });

  it("with negative real number gives correct value", () => {
    const result = whole_fract(-14.75);

    expect(result).toEqual([-15, 0.25]);
  });
});
