import { describe, it, expect } from "vitest";
import { sample_single_cycle } from "./sample_single_cycle.js";
import { sawtooth, sine } from "./basic_waves.js";
import { SAMPLE_RATE } from "./encode_wav.js";
import { expect_arrays } from "../test_helpers/expect_arrays.js";

describe("sample_single_cycle", () => {
  it("with zero frequency throws error", () => {
    expect(() => {
      return sample_single_cycle(sine, 0);
    }).toThrowError("frequency must be positive");
  });

  it("with quarter of sampling rate samples sine correctly", () => {
    const sample_count = 4;
    const freq = SAMPLE_RATE / sample_count;

    const result = sample_single_cycle(sine, freq);

    // sampling a sine wave with 4 samples should produce the points at
    // 0, pi/2, pi, 3pi/2 (but not 2pi! that's the first sample of the next cycle)
    const expected = new Float32Array([0, 1, 0, -1]);
    expect_arrays(result, expected, (r, e) => expect(r).toBeCloseTo(e));
  });

  it("computes correct number of samples for single cycle", () => {
    // A4 = 440 Hz
    const freq = 440;

    const result = sample_single_cycle(sawtooth, freq);

    // 44100 / 440 = 100.227, this rounds down to 100
    const expected = 100;
    expect(result.length).toEqual(expected);
  });
});
