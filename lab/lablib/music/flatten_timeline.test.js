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

    expect(result).toStrictEqual(seq);
  });

  it("with Sequential with single child returns child", () => {
    const interval = stub_interval(1, N4);
    const seq = new Sequential(interval);

    const result = flatten_timeline(seq);

    expect(result).toBe(interval);
  });

  it("with Sequential containing only zero gaps returns zero gap", () => {
    const seq = new Sequential(Gap.ZERO, Gap.ZERO);

    const result = flatten_timeline(seq);

    expect(result).toBe(Gap.ZERO);
  });

  it("with Sequential with zero gaps filters out gaps", () => {
    const interval = stub_interval(1, N4);
    const seq = new Sequential(
      interval,
      Gap.ZERO,
      interval,
      interval,
      Gap.ZERO
    );

    const result = flatten_timeline(seq);

    const expected = new Sequential(interval, interval, interval);
    expect(result).toStrictEqual(expected);
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

    expect(result).toStrictEqual(expected);
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

    expect(result).toStrictEqual(expected);
  });

  it("with Parallel containing only zero gaps returns zero gap", () => {
    const seq = new Parallel(Gap.ZERO, Gap.ZERO);

    const result = flatten_timeline(seq);

    expect(result).toBe(Gap.ZERO);
  });

  it("with Parallel with zero gaps filters out gaps", () => {
    const interval = stub_interval(1, N4);
    const seq = new Parallel(interval, Gap.ZERO, interval, interval, Gap.ZERO);

    const result = flatten_timeline(seq);

    const expected = new Parallel(interval, interval, interval);
    expect(result).toStrictEqual(expected);
  });

  it("flattens sequential within parallel", () => {
    const interval1 = stub_interval(1, N4);
    const interval2 = stub_interval(2, N2);
    const nested = new Parallel(
      new Sequential(
        interval1,
        new Sequential(interval2, interval1),
        interval1
      ),
      interval1
    );

    const result = flatten_timeline(nested);

    const expected = new Parallel(
      new Sequential(interval1, interval2, interval1, interval1),
      interval1
    );
    expect(result).toStrictEqual(expected);
  });

  it("flattens parallel within sequential", () => {
    const interval1 = stub_interval(1, N4);
    const interval2 = stub_interval(2, N2);
    const nested = new Sequential(
      new Parallel(interval1, new Parallel(interval2, interval1), interval1),
      interval1
    );

    const result = flatten_timeline(nested);

    const expected = new Sequential(
      new Parallel(interval1, interval2, interval1, interval1),
      interval1
    );
    expect(result).toStrictEqual(expected);
  });

  it("flattens sequential across redundant parallel", () => {
    const interval1 = stub_interval(1, N4);
    const interval2 = stub_interval(2, N2);

    const nested = new Sequential(
      interval1,
      // The parallel is redundant, but puts a layer between the
      // sequentials
      new Parallel(new Sequential(interval2, interval2)),
      new Sequential(interval1, interval1)
    );

    const result = flatten_timeline(nested);

    const expected = new Sequential(
      interval1,
      interval2,
      interval2,
      interval1,
      interval1
    );
    expect(result).toStrictEqual(expected);
  });

  it("flattens parallel over redundant sequential", () => {
    const interval1 = stub_interval(1, N4);
    const interval2 = stub_interval(2, N2);

    const nested = new Parallel(
      interval1,
      new Sequential(new Parallel(interval2, interval2)),
      new Parallel(interval1, interval1)
    );

    const result = flatten_timeline(nested);

    const expected = new Parallel(
      interval1,
      interval2,
      interval2,
      interval1,
      interval1
    );
    expect(result).toStrictEqual(expected);
  });

  it("flattens complex empty timeline to zero gap", () => {
    const whole_lot_of_nothing = new Sequential(
      new Sequential(),
      new Parallel(new Sequential(), new Sequential(Gap.ZERO)),
      Gap.ZERO,
      new Sequential(new Sequential()),
      new Parallel(new Sequential(), Gap.ZERO),
      Gap.ZERO
    );

    const result = flatten_timeline(whole_lot_of_nothing);

    expect(result).toBe(Gap.ZERO);
  });
});
