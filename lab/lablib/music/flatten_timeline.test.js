import { describe, it, expect } from "vitest";
import { flatten_timeline } from "./flatten_timeline.js";
import { Gap, Sequential } from "./Timeline.js";
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

  it("with flat Sequential is identity", () => {
    const seq = new Sequential(stub_interval(1, N4), stub_interval(1, N4));
    const result = flatten_timeline(seq);
    expect(result).toEqual(seq);
  });

  it("with Sequential with single interval returns inner interval", () => {
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
});
