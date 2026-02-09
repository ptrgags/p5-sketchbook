import { describe, it, expect } from "vitest";
import { Rational } from "../Rational";
import {
  Gap,
  Parallel,
  Sequential,
  TimeInterval,
  timeline_map,
} from "./Timeline";

describe("Sequential", () => {
  it("duration computes sum of simple intervals", () => {
    const seq = new Sequential(
      new TimeInterval(1, new Rational(1, 1)),
      new TimeInterval(2, new Rational(1, 2)),
    );

    const result = seq.duration;

    // 1 + 1/2 = 3/2
    const expected = new Rational(3, 2);
    expect(result).toEqual(expected);
  });

  it("duration computes sum of of sub-sequences", () => {
    const seq = new Sequential(
      new TimeInterval(1, new Rational(1, 1)),
      new Sequential(
        new TimeInterval(2, new Rational(1, 2)),
        new TimeInterval(3, new Rational(2, 1)),
      ),
      new TimeInterval(4, new Rational(1, 2)),
    );

    const result = seq.duration;

    // 1 + 1/2 + 2 + 1/2 = 4
    const expected = new Rational(4, 1);
    expect(result).toEqual(expected);
  });

  describe("from_repeat", () => {
    it("with 0 repeats throws error", () => {
      const interval = new TimeInterval(1, new Rational(2));
      expect(() => {
        return Sequential.from_repeat(interval, 0);
      }).toThrowError("repeats must be a positive integer");
    });

    it("with 1 repeat returns material as-is", () => {
      const interval = new TimeInterval(1, new Rational(2));

      const result = Sequential.from_repeat(interval, 1);

      expect(result).toBe(interval);
    });

    it("with multiple repeats repeats material inside a Sequential", () => {
      const interval = new TimeInterval(1, new Rational(2));

      const result = Sequential.from_repeat(interval, 3);

      const expected = new Sequential(interval, interval, interval);
      expect(result).toEqual(expected);
    });
  });

  describe("from_loop", () => {
    it("with 0 duration throws error", () => {
      const interval = new TimeInterval(1, new Rational(2));

      expect(() => {
        return Sequential.from_loop(interval, new Rational(0));
      }).toThrowError("total duration must be nonzero");
    });

    it("with duration equal to material duration returns material as-is", () => {
      const duration = new Rational(2);
      const interval = new TimeInterval(1, duration);

      const result = Sequential.from_loop(interval, duration);

      expect(result).toBe(interval);
    });

    it("with whole number of loops returns sequential as a repeat", () => {
      const interval = new TimeInterval(1, new Rational(2));

      // A single interval is 2 measures, so 4 loops would be 8 measures
      const result = Sequential.from_loop(interval, new Rational(8));

      const expected = new Sequential(interval, interval, interval, interval);
      expect(result).toEqual(expected);
    });

    it("with partial loop throws error (for now)", () => {
      const interval = new TimeInterval(1, new Rational(2));

      expect(() => {
        return Sequential.from_loop(interval, new Rational(3));
      }).toThrowError("Not yet implemented: partial loop");
    });
  });
});

describe("Parallel", () => {
  it("duration computes max of simple intervals", () => {
    const seq = new Parallel(
      new TimeInterval(1, new Rational(1, 1)),
      new TimeInterval(1, new Rational(1, 2)),
    );

    const result = seq.duration;

    const expected = new Rational(1, 1);
    expect(result).toEqual(expected);
  });

  it("duration computes max of sub-parallels", () => {
    const seq = new Parallel(
      new TimeInterval(1, new Rational(1, 1)),
      new Parallel(
        new TimeInterval(1, new Rational(1, 2)),
        new TimeInterval(1, new Rational(2, 1)),
      ),
      new TimeInterval(1, new Rational(1, 2)),
    );

    const result = seq.duration;

    const expected = new Rational(2, 1);
    expect(result).toEqual(expected);
  });
});

describe("timeline_map", () => {
  it("maps function over complex timeline", () => {
    const original = new Parallel(
      new Sequential(
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(new Rational(1, 4)),
        new TimeInterval(2, new Rational(3, 1)),
      ),
      new Sequential(
        new TimeInterval(3, new Rational(4, 5)),
        new TimeInterval(4, new Rational(1, 2)),
      ),
    );

    const result = timeline_map((interval) => {
      return new TimeInterval(interval.value + 10, interval.duration);
    }, original);

    const expected = new Parallel(
      new Sequential(
        new TimeInterval(11, new Rational(1, 2)),
        new Gap(new Rational(1, 4)),
        new TimeInterval(12, new Rational(3, 1)),
      ),
      new Sequential(
        new TimeInterval(13, new Rational(4, 5)),
        new TimeInterval(14, new Rational(1, 2)),
      ),
    );
    expect(result).toEqual(expected);
  });
});
