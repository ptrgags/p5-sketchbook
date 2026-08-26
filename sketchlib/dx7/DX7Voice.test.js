import { describe, it, expect } from "vitest";
import { DX7Voice } from "./DX7Voice.js";
import { DX7Operator } from "./DX7Operator.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7LFO } from "./DX7LFO.js";

const DEFAULT_SETTINGS = {
  name: "DEFAULT",
  algorithm: 0,
  feedback: 0,
  operators: [
    DX7Operator.init(1, 99),
    DX7Operator.init(2, 0),
    DX7Operator.init(3, 0),
    DX7Operator.init(4, 0),
    DX7Operator.init(5, 0),
    DX7Operator.init(6, 0),
  ],
  pitch_env: DX7Envelope.DEFAULT_PITCH,
  lfo: DX7LFO.INIT,
  osc_key_sync: true,
  transpose: 7,
};

describe("DX7Voice", () => {
  it("with less than 6 operators throws error", () => {
    expect(() => {
      return new DX7Voice({
        ...DEFAULT_SETTINGS,
        operators: [DX7Operator.init(1, 99), DX7Operator.init(2, 0)],
      });
    }).toThrowError("There must be exactly 6 operators");
  });

  it("with more than 6 operators throws error", () => {
    expect(() => {
      return new DX7Voice({
        ...DEFAULT_SETTINGS,
        operators: [
          DX7Operator.init(1, 99),
          DX7Operator.init(2, 0),
          DX7Operator.init(3, 0),
          DX7Operator.init(4, 0),
          DX7Operator.init(5, 0),
          DX7Operator.init(6, 0),
          DX7Operator.init(7, 0),
        ],
      });
    }).toThrowError("There must be exactly 6 operators");
  });

  it("with long name truncates to 10 characters", () => {
    const voice = new DX7Voice({
      ...DEFAULT_SETTINGS,
      name: "this is a very long patch name",
    });

    const result = voice.name;

    const expected = "this is a ";
    expect(result).toEqual(expected);
  });

  it("with short name pads to 10 characters with spaces", () => {
    const voice = new DX7Voice({
      ...DEFAULT_SETTINGS,
      name: "short",
    });

    const result = voice.name;

    const expected = "short     ";
    expect(result).toEqual(expected);
  });

  it("with non-ascii name replaces bad characters with spaces", () => {
    const voice = new DX7Voice({
      ...DEFAULT_SETTINGS,
      name: "❌Whoops",
    });

    const result = voice.name;

    const expected = " Whoops   ";
    expect(result).toEqual(expected);
  });

  it("algorithm_display returns human-readable algorithm value", () => {
    const voice = new DX7Voice({
      ...DEFAULT_SETTINGS,
      algorithm: 3,
    });

    expect(voice.algorithm).toEqual(3);
    expect(voice.algorithm_display).toEqual(4);
  });

  it("transpose_display returns human-readable transpose value", () => {
    const voice = new DX7Voice({
      ...DEFAULT_SETTINGS,
      transpose: 3,
    });

    expect(voice.transpose).toEqual(3);
    expect(voice.transpose_display).toEqual(-21);
  });

  it("rename returns same voice with different name", () => {
    const voice = new DX7Voice({
      ...DEFAULT_SETTINGS,
      algorithm: 5,
      name: "before",
    });

    const result = voice.rename("after");

    const expected = new DX7Voice({
      ...DEFAULT_SETTINGS,
      algorithm: 5,
      name: "after",
    });
    expect(result).toEqual(expected);
  });
});
