import { describe, it, expect } from "vitest";
import { DX7Operator } from "./DX7Operator.js";
import { DX7Envelope } from "./DX7Envelope.js";
import { DX7FreqMode, DX7FreqSettings } from "./DX7FreqSettings.js";
import { DX7KeyLevelScaling } from "./DX7KeyLevelScaling.js";

describe("DX7Operator", () => {
  it("name returns OP N", () => {
    const operator = DX7Operator.init(3, 99);

    const result = operator.name;

    const expected = "OP 3";
    expect(result).toEqual(expected);
  });

  it("renumber clones operator with different number", () => {
    const operator = new DX7Operator({
      num: 2,
      envelope: DX7Envelope.DEFAULT_ENV,
      level: 80,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 0, 2, 0),
      amp_mod_sensitivity: 0,
      key_rate_scaling: 0,
      key_vel_sensitivity: 0,
      key_level_scaling: DX7KeyLevelScaling.INIT,
    });

    const result = operator.renumber(5);

    const expected = new DX7Operator({
      num: 5,
      envelope: DX7Envelope.DEFAULT_ENV,
      level: 80,
      freq: new DX7FreqSettings(DX7FreqMode.RATIO, 0, 2, 0),
      amp_mod_sensitivity: 0,
      key_rate_scaling: 0,
      key_vel_sensitivity: 0,
      key_level_scaling: DX7KeyLevelScaling.INIT,
    });
    expect(result).toEqual(expected);
  });
});
