import { describe, it, expect } from "vitest";
import { dx7_checksum } from "./dx7_checksum.js";

describe("dx7_checksum", () => {
  it("with no bytes returns 0", () => {
    const bytes = new Uint8Array([]);

    const result = dx7_checksum(bytes);

    const expected = 0;
    expect(result).toEqual(expected);
  });

  it("with zero bytes returns 0", () => {
    const bytes = new Uint8Array([0, 0, 0]);

    const result = dx7_checksum(bytes);

    const expected = 0;
    expect(result).toEqual(expected);
  });

  it("with small values returns correct checksum", () => {
    const bytes = new Uint8Array([1, 2, 3]);

    const result = dx7_checksum(bytes);

    // bytes sum to 6:   0b00000110
    // two's complement: 0b11111010
    // mask to 7 bits:   0b01111010 (=122)
    const expected = 122;
    expect(result).toEqual(expected);
  });

  it("with sum that overflows returns correct checksum", () => {
    // wow I was arbitrarily picking numbers but it just so happens to
    // add up to a nice even 600 :D
    const bytes = new Uint8Array([100, 50, 75, 125, 250]);

    const result = dx7_checksum(bytes);

    // bytes sum to 600: 0b00000010_01011000
    // two's complement: 0b11111101_10101000
    // mask to 7 bits:            0b00101000 (32 + 8 = 40)
    const expected = 40;
    expect(result).toEqual(expected);
  });
});
