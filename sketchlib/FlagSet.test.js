import { describe, it, expect } from "vitest";
import { FlagSet } from "./FlagSet";

describe("FlagSet", () => {
  it("Sets initial flags", () => {
    const flags = new FlagSet(0b0011, 4);

    expect(flags.has_flag(0)).toBe(true);
    expect(flags.has_flag(1)).toBe(true);
    expect(flags.has_flag(2)).toBe(false);
    expect(flags.has_flag(3)).toBe(false);
  });

  it("set_flag with negative flag throws error", () => {
    const flags = new FlagSet(0, 4);

    expect(() => {
      flags.set_flag(-1);
    }).toThrowError("out of bounds");
  });

  it("set_flag with out of bounds flag throws error", () => {
    const flags = new FlagSet(0, 4);

    expect(() => {
      flags.set_flag(4);
    }).toThrowError("out of bounds");
  });

  it("has_flag with negative flag throws error", () => {
    const flags = new FlagSet(0, 4);

    expect(() => {
      flags.has_flag(-1);
    }).toThrowError("out of bounds");
  });

  it("has_flag with out of bounds flag throws error", () => {
    const flags = new FlagSet(0, 4);

    expect(() => {
      flags.has_flag(4);
    }).toThrowError("out of bounds");
  });

  it("gets and sets flag", () => {
    const flags = new FlagSet(0, 4);

    expect(flags.has_flag(1)).toBe(false);

    flags.set_flag(1);

    expect(flags.has_flag(1)).toBe(true);
  });
});
