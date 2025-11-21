import { describe, it, expect } from "vitest";
import { Rational } from "../Rational";
import { Gap, Parallel, Sequential, timeline_map } from "./Timeline";

/**
 * Make an interval object for use in tests below
 * @param {Rational} duration
 * @param {number} value
 * @returns {object} An interval
 */
function make_interval(duration, value) {
  return {
    duration,
    value,
  };
}

describe("Sequential", () => {
  it("duration computes sum of simple intervals", () => {
    const seq = new Sequential(
      make_interval(new Rational(1, 1), 1),
      make_interval(new Rational(1, 2), 1)
    );

    const result = seq.duration;

    // 1 + 1/2 = 3/2
    const expected = new Rational(3, 2);
    expect(result).toEqual(expected);
  });

  it("duration computes sum of of sub-sequences", () => {
    const seq = new Sequential(
      make_interval(new Rational(1, 1), 1),
      new Sequential(
        make_interval(new Rational(1, 2), 1),
        make_interval(new Rational(2, 1), 1)
      ),
      make_interval(new Rational(1, 2), 1)
    );

    const result = seq.duration;

    // 1 + 1/2 + 2 + 1/2 = 4
    const expected = new Rational(4, 1);
    expect(result).toEqual(expected);
  });

  describe("from_repeat", () => {
    it("with 0 repeats throws error", () => {
      const interval = make_interval(new Rational(2), 1);
      expect(() => {
        return Sequential.from_repeat(interval, 0);
      }).toThrowError("repeats must be a positive integer");
    });

    it("with 1 repeat returns material as-is", () => {
      const interval = make_interval(new Rational(2), 1);

      const result = Sequential.from_repeat(interval, 1);

      expect(result).toBe(interval);
    });

    it("with multiple repeats repeats material inside a Sequential", () => {
      const interval = make_interval(new Rational(2), 1);

      const result = Sequential.from_repeat(interval, 3);

      const expected = new Sequential(interval, interval, interval);
      expect(result).toEqual(expected);
    });
  });

  describe("from_loop", () => {
    it("with 0 duration throws error", () => {
      const interval = make_interval(new Rational(2), 1);

      expect(() => {
        return Sequential.from_loop(interval, new Rational(0));
      }).toThrowError("total duration must be nonzero");
    });

    it("with duration equal to material duration returns material as-is", () => {
      const duration = new Rational(2);
      const interval = make_interval(duration, 1);

      const result = Sequential.from_loop(interval, duration);

      expect(result).toBe(interval);
    });

    it("with whole number of loops returns sequential as a repeat", () => {
      const interval = make_interval(new Rational(2), 1);

      // A single interval is 2 measures, so 4 loops would be 8 measures
      const result = Sequential.from_loop(interval, new Rational(8));

      const expected = new Sequential(interval, interval, interval, interval);
      expect(result).toEqual(expected);
    });

    it("with partial loop throws error (for now)", () => {
      const interval = make_interval(new Rational(2), 1);

      expect(() => {
        return Sequential.from_loop(interval, new Rational(3));
      }).toThrowError("Not yet implemented: partial loop");
    });
  });
});

describe("Parallel", () => {
  it("duration computes max of simple intervals", () => {
    const seq = new Parallel(
      make_interval(new Rational(1, 1), 1),
      make_interval(new Rational(1, 2), 1)
    );

    const result = seq.duration;

    const expected = new Rational(1, 1);
    expect(result).toEqual(expected);
  });

  it("duration computes max of sub-parallels", () => {
    const seq = new Parallel(
      make_interval(new Rational(1, 1), 1),
      new Parallel(
        make_interval(new Rational(1, 2), 1),
        make_interval(new Rational(2, 1), 1)
      ),
      make_interval(new Rational(1, 2), 1)
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
        make_interval(new Rational(1, 2), 1),
        new Gap(new Rational(1, 4)),
        make_interval(new Rational(3, 1), 2)
      ),
      new Sequential(
        make_interval(new Rational(4, 5), 3),
        make_interval(new Rational(1, 2), 4)
      )
    );

    const result = timeline_map((interval) => {
      return make_interval(interval.duration, interval.value + 10);
    }, original);

    const expected = new Parallel(
      new Sequential(
        make_interval(new Rational(1, 2), 11),
        new Gap(new Rational(1, 4)),
        make_interval(new Rational(3, 1), 12)
      ),
      new Sequential(
        make_interval(new Rational(4, 5), 13),
        make_interval(new Rational(1, 2), 14)
      )
    );
    expect(result).toEqual(expected);
  });
});
