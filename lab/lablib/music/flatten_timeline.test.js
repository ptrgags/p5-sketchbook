import { describe, it, expect } from "vitest";
import { flatten_timeline } from "./flatten_timeline.js";
import { Gap, Parallel, Sequential } from "./Timeline.js";
import { N2, N4 } from "./durations";

function stub_interval(value, duration) {
  return {
    value,
    duration,
  };
}

describe("flatten_timeline", () => {
  it("with Gap is identity", () => {
    const gap = new Gap(N4);

    const result = flatten_timeline(gap);

    expect(result).toBe(gap);
  });

  it("with interval is identity", () => {
    const interval = stub_interval(3, N4);

    const result = flatten_timeline(interval);

    expect(result).toBe(interval);
  });

  it("with empty Sequential gives empty timeline", () => {
    const seq = new Sequential();

    const result = flatten_timeline(seq);

    expect(result).toBe(Gap.ZERO);
  });

  it("with flat Sequential is identity", () => {
    const seq = new Sequential(stub_interval(1, N4), stub_interval(1, N4));

    const result = flatten_timeline(seq);

    expect(result).toEqual(seq);
  });

  it("with Sequential with single child returns child", () => {
    const interval = stub_interval(1, N4);
    const seq = new Sequential(interval);

    const result = flatten_timeline(seq);

    expect(result).toEqual(interval);
  });

  it("with nested Sequentials returns flattened Sequential", () => {
    const interval1 = stub_interval(1, N4);
    const interval2 = stub_interval(2, N2);
    const nested = new Sequential(
      new Sequential(interval1, interval2),
      interval2,
      new Sequential(interval1),
      new Sequential(interval2, interval2),
      interval1
    );

    const result = flatten_timeline(nested);

    // Same thing flattened into a single array
    const expected = new Sequential(
      interval1,
      interval2,
      interval2,
      interval1,
      interval2,
      interval2,
      interval1
    );

    expect(result).toEqual(expected);
  });

  it("with empty Parallel gives empty timeline", () => {
    const par = new Parallel();

    const result = flatten_timeline(par);

    expect(result).toBe(Gap.ZERO);
  });

  it("with Parallel with single child returns child", () => {
    const interval = stub_interval(1, N4);
    const par = new Parallel(interval);

    const result = flatten_timeline(par);

    expect(result).toBe(interval);
  });

  it("with Parallel with single child returns child", () => {
    const interval1 = stub_interval(1, N4);
    const interval2 = stub_interval(2, N2);
    const nested = new Parallel(
      new Parallel(interval1, interval2),
      interval2,
      new Parallel(interval1),
      new Parallel(interval2, interval2),
      interval1
    );

    const result = flatten_timeline(nested);

    // Same thing flattened into a single array
    const expected = new Parallel(
      interval1,
      interval2,
      interval2,
      interval1,
      interval2,
      interval2,
      interval1
    );

    expect(result).toEqual(expected);
  });
});
