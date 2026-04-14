import { describe, it, expect } from "vitest";
import { sawtooth, sine } from "./basic_waves.js";
import { SAMPLE_RATE } from "./encode_wav.js";
import { expect_arrays } from "../test_helpers/expect_arrays.js";
import { sample_n_cycles, sample_wave } from "./sample_wave.js";

describe("sample_wave", () => {
  it("Produces a buffer with the correct number of samples", () => {
    const result = sample_wave(sine, 440, 250).length;

    const expected = 250;
    expect(result).toEqual(expected);
  });
});

describe("sample_n_cycles", () => {
  it("with zero frequency throws error", () => {
    expect(() => {
      return sample_n_cycles(sine, 0, 1);
    }).toThrowError("frequency must be positive");
  });

  it("with quarter of sampling rate samples sine correctly", () => {
    const sample_count = 4;
    const freq = SAMPLE_RATE / sample_count;

    const result = sample_n_cycles(sine, freq, 1);

    // sampling a sine wave with 4 samples should produce the points at
    // 0, pi/2, pi, 3pi/2 (but not 2pi! that's the first sample of the next cycle)
    const expected = new Float32Array([0, 1, 0, -1]);
    expect_arrays(result, expected, (r, e) => expect(r).toBeCloseTo(e));
  });

  it("computes correct number of samples for single cycle", () => {
    // A4 = 440 Hz
    const freq = 440;

    const result = sample_n_cycles(sawtooth, freq, 1);

    // 44100 / 440 = 100.227, this rounds down to 100
    const expected = 100;
    expect(result.length).toEqual(expected);
  });

  it("with sawtooth wave computes correct values", () => {
    const sample_count = 12;
    const freq = SAMPLE_RATE / sample_count;

    const result = sample_n_cycles(sawtooth, freq, 1);

    // This sawtooth wave ramps from 1 to -1 over 12 samples, something like:
    // lerp(1, -1, i/12)
    // = (12-i)/12 - i/12
    // = 12/12 - i/12 - i/12
    // = 1 - i/6
    const expected = new Float32Array([
      1,
      1 - 1 / 6,
      1 - 2 / 6,
      1 - 3 / 6,
      1 - 4 / 6,
      1 - 5 / 6,
      1 - 6 / 6,
      1 - 7 / 6,
      1 - 8 / 6,
      1 - 9 / 6,
      1 - 10 / 6,
      1 - 11 / 6,
    ]);
    expect(result).toEqual(expected);
  });

  it("with multiple cycles repeats the array entries", () => {
    const sample_count = 4;
    const freq = SAMPLE_RATE / sample_count;

    const result = sample_n_cycles(sine, freq, 4);

    // sampling a sine wave with 4 samples should produce the points at
    // 0, pi/2, pi, 3pi/2 (but not 2pi! that's the first sample of the next cycle)
    const expected = new Float32Array([
      0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1,
    ]);
    expect_arrays(result, expected, (r, e) => expect(r).toBeCloseTo(e));
  });
});
