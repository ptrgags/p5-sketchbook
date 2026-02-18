import { describe, it, expect } from "vitest";
import { RelTimelineOps } from "./RelTimelineOps.js";
import { Gap, Parallel, Sequential, TimeInterval } from "./Timeline.js";
import { Rational } from "../Rational.js";

describe("RelTimelineOps", () => {
  describe("iter_with_gaps", () => {
    it("with Gap returns gap", () => {
      const timeline = new Gap(Rational.ONE);

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [timeline];
      expect(result).toEqual(expected);
    });

    it("with TimeInterval returns interval", () => {
      const timeline = new TimeInterval(1, Rational.ONE);

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [timeline];
      expect(result).toEqual(expected);
    });

    it("with Sequential returns inner intervals", () => {
      const timeline = new Sequential(
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(Rational.ONE),
        new TimeInterval(3, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(Rational.ONE),
        new TimeInterval(3, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });

    it("with Parallel returns inner intervals in order listed", () => {
      const timeline = new Parallel(
        new Sequential(
          new Gap(new Rational(1, 2)),
          new TimeInterval(2, new Rational(1, 2)),
        ),
        new TimeInterval(1, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_with_gaps(timeline)];

      const expected = [
        new Gap(new Rational(1, 2)),
        new TimeInterval(2, new Rational(1, 2)),
        new TimeInterval(1, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });
  });

  describe("iter_intervals", () => {
    it("with Gap yields nothing", () => {
      const timeline = new Gap(Rational.ONE);

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [];
      expect(result).toEqual(expected);
    });

    it("with TimeInterval returns interval", () => {
      const timeline = new TimeInterval(1, Rational.ONE);

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [timeline];
      expect(result).toEqual(expected);
    });

    it("with Sequential returns inner intervals", () => {
      const timeline = new Sequential(
        new TimeInterval(1, new Rational(1, 2)),
        new Gap(Rational.ONE),
        new TimeInterval(3, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [
        new TimeInterval(1, new Rational(1, 2)),
        new TimeInterval(3, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });

    it("with Parallel returns inner intervals in the order listed", () => {
      const timeline = new Parallel(
        new Sequential(
          new Gap(new Rational(1, 2)),
          new TimeInterval(2, new Rational(1, 2)),
        ),
        new TimeInterval(1, Rational.ONE),
      );

      const result = [...RelTimelineOps.iter_intervals(timeline)];

      const expected = [
        new TimeInterval(2, new Rational(1, 2)),
        new TimeInterval(1, Rational.ONE),
      ];
      expect(result).toEqual(expected);
    });
  });

  describe("smallest_subdivision", () => {
    it("with empty timeline returns 1", () => {
      const empty = Gap.ZERO;

      const result = RelTimelineOps.smallest_subdivision(empty);

      const expected = Rational.ONE;
      expect(result).toEqual(expected);
    });

    it("with intervals of the same duration returns that duration", () => {
      const interval = new TimeInterval(1, new Rational(1, 4));
      const timeline = new Sequential(interval, interval, interval, interval);

      const result = RelTimelineOps.smallest_subdivision(interval);

      const expected = new Rational(1, 4);
      expect(result).toEqual(expected);
    });

    it("includes gaps in calculation", () => {
      const interval = new TimeInterval(1, new Rational(1, 4));
      const gap = new Gap(new Rational(1, 8));
      const timeline = new Sequential(
        interval,
        interval,
        gap,
        interval,
        interval,
        gap,
      );

      const result = RelTimelineOps.smallest_subdivision(timeline);

      const expected = new Rational(1, 8);
      expect(result).toEqual(expected);
    });

    it("computes smallest subdivision across all intervals and gaps", () => {
      const interval = new TimeInterval(1, new Rational(1, 4));
      const gap = new Gap(new Rational(1, 8));
      const another = new TimeInterval(2, new Rational(4, 3));
      const timeline = new Sequential(
        interval,
        interval,
        gap,
        interval,
        another,
        interval,
        gap,
      );

      const result = RelTimelineOps.smallest_subdivision(timeline);

      // gcd(1/4, 1/8, 4/3) = gcd(1, 1, 4)/lcm(4, 8, 3) = 1/lcm(12, 8)
      // lcm(12, 8) = 12 * 8 / gcd(12, 8) = 12 * 8 / gcd(8, 4) = 12 * 8 / 4
      // = 12 * 2 = 24
      // so the result is 1/24
      const expected = new Rational(1, 24);
      expect(result).toEqual(expected);
    });
  });
});
