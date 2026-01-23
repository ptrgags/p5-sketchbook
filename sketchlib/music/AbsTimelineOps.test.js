import { describe, it, expect } from "vitest";
import { Rational } from "../Rational.js";
import {
  AbsGap,
  AbsInterval,
  AbsSequential,
  AbsParallel,
} from "./AbsTimeline.js";
import { AbsTimelineOps } from "./AbsTimelineOps.js";
import { Gap, Sequential, Parallel } from "./Timeline.js";

/**
 * Make an interval object for use in tests below
 * @param {Rational} duration
 * @param {number} value
 * @returns {object} An interval
 */
function stub_interval(duration, value) {
  return {
    duration,
    value,
  };
}

describe("AbsTimelineOps", () => {
  describe("from_relative", () => {
    it("with Gap gives AbsGap", () => {
      const result = AbsTimelineOps.from_relative(
        new Gap(Rational.ONE),
        new Rational(2),
      );

      const expected = new AbsGap(new Rational(2), new Rational(3));
      expect(result).toEqual(expected);
    });

    it("With interval gives AbsInterval", () => {
      const duration = new Rational(1, 2);
      const timeline = stub_interval(duration, 3);

      const result = AbsTimelineOps.from_relative(timeline, new Rational(2));

      const expected = new AbsInterval(
        timeline,
        new Rational(2),
        new Rational(5, 2),
      );
      expect(result).toEqual(expected);
    });

    it("with offset schedules event with times offset", () => {
      const timeline = stub_interval(Rational.ONE, 3);
      const offset = new Rational(1, 4);

      const result = AbsTimelineOps.from_relative(timeline, offset);

      const expected = new AbsInterval(timeline, offset, new Rational(5, 4));
      expect(result).toEqual(expected);
    });

    it("schedules sequential timeline with correct timing", () => {
      const timeline1 = stub_interval(Rational.ONE, 1);
      const timeline2 = stub_interval(new Rational(1, 2), 2);
      const timeline = new Sequential(timeline2, timeline1, timeline2);

      const result = AbsTimelineOps.from_relative(timeline, Rational.ZERO);

      const expected = new AbsSequential(
        new AbsInterval(timeline2, Rational.ZERO, new Rational(1, 2)),
        new AbsInterval(timeline1, new Rational(1, 2), new Rational(3, 2)),
        new AbsInterval(timeline2, new Rational(3, 2), new Rational(2)),
      );
      expect(result).toEqual(expected);
    });

    it("with sequential timeline produces one event per child", () => {
      const timeline1 = stub_interval(Rational.ONE, 1);
      const timeline2 = stub_interval(new Rational(1, 2), 2);
      const timeline = new Sequential(timeline2, timeline1, timeline2);
      const offset = new Rational(1, 2);

      const result = AbsTimelineOps.from_relative(timeline, offset);

      const expected = new AbsSequential(
        new AbsInterval(timeline2, offset, Rational.ONE),
        new AbsInterval(timeline1, Rational.ONE, new Rational(2)),
        new AbsInterval(timeline2, new Rational(2), new Rational(5, 2)),
      );
      expect(result).toEqual(expected);
    });

    it("with parallel timeline produces AbsParallel with correct timing", () => {
      const timeline1 = stub_interval(Rational.ONE, 1);
      const timeline2 = stub_interval(new Rational(1, 2), 2);
      const timeline = new Parallel(timeline1, timeline2);

      const result = AbsTimelineOps.from_relative(timeline, Rational.ZERO);

      const expected = new AbsParallel(
        new AbsInterval(timeline1, Rational.ZERO, Rational.ONE),
        new AbsInterval(timeline2, Rational.ZERO, new Rational(1, 2)),
      );
      expect(result).toEqual(expected);
    });
  });

  describe("from_intervals", () => {
    it("with no intervals returns empty timeline", () => {
      const result = AbsTimelineOps.from_intervals([]);

      expect(result).toEqual(AbsGap.ZERO);
    });

    it("with single interval returns interval", () => {
      const interval = new AbsInterval(1, Rational.ZERO, Rational.ONE);

      const result = AbsTimelineOps.from_intervals([interval]);

      expect(result).toBe(interval);
    });

    it("with two intervals that meet exactly returns AbsSequential", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsSequential(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      );
      expect(result).toEqual(expected);
    });

    it("with two intervals that are out of order returns AbsSequential in sorted order", () => {
      const intervals = [
        new AbsInterval(2, new Rational(2), new Rational(3)),
        new AbsInterval(1, Rational.ONE, new Rational(2)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsSequential(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(2), new Rational(3)),
      );
      expect(result).toEqual(expected);
    });

    it("with two intervals with gap in between returns AbsSequential including gap", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(3), new Rational(4)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsSequential(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsGap(new Rational(2), new Rational(3)),
        new AbsInterval(2, new Rational(3), new Rational(4)),
      );
      expect(result).toEqual(expected);
    });

    it("with two simultaneous intervals returns AbsParallel", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, Rational.ONE, new Rational(2)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsParallel(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, Rational.ONE, new Rational(2)),
      );
      expect(result).toEqual(expected);
    });

    it("with partially overlapping intervals returns AbsParallel including explicit gap", () => {
      const intervals = [
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsInterval(2, new Rational(3, 2), new Rational(2)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      const expected = new AbsParallel(
        new AbsInterval(1, Rational.ONE, new Rational(2)),
        new AbsSequential(
          new AbsGap(Rational.ONE, new Rational(3, 2)),
          new AbsInterval(2, new Rational(3, 2), new Rational(2)),
        ),
      );
      expect(result).toEqual(expected);
    });

    it("with brick wall overlap returns AbsParallel with two lanes", () => {
      // |   |   |   |   |
      // 1-------
      //     2-------
      //         3-------
      const intervals = [
        new AbsInterval(1, Rational.ZERO, new Rational(2)),
        new AbsInterval(2, Rational.ONE, new Rational(3)),
        new AbsInterval(3, new Rational(2), new Rational(4)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      // The third interval should slot in like this:
      // |   |   |   |   |
      // 1-------3-------
      // ~~~~2-------
      const expected = new AbsParallel(
        new AbsSequential(
          new AbsInterval(1, Rational.ZERO, new Rational(2)),
          new AbsInterval(3, new Rational(2), new Rational(4)),
        ),
        new AbsSequential(
          new AbsGap(Rational.ZERO, Rational.ONE),
          new AbsInterval(2, Rational.ONE, new Rational(3)),
        ),
      );
      expect(result).toEqual(expected);
    });

    it("with three overlapping intervals returns AbsParallel with three lanes", () => {
      // |   |   |   |   |
      // 1-----------
      //     2-------
      //         3-------
      const intervals = [
        new AbsInterval(1, Rational.ZERO, new Rational(3)),
        new AbsInterval(2, Rational.ONE, new Rational(3)),
        new AbsInterval(3, new Rational(2), new Rational(4)),
      ];

      const result = AbsTimelineOps.from_intervals(intervals);

      // |   |   |   |   |
      // 1-----------
      // ~~~~2-------
      // ~~~~~~~~3-------
      const expected = new AbsParallel(
        new AbsInterval(1, Rational.ZERO, new Rational(3)),
        new AbsSequential(
          new AbsGap(Rational.ZERO, Rational.ONE),
          new AbsInterval(2, Rational.ONE, new Rational(3)),
        ),
        new AbsSequential(
          new AbsGap(Rational.ZERO, new Rational(2)),
          new AbsInterval(3, new Rational(2), new Rational(4)),
        ),
      );
      expect(result).toEqual(expected);
    });
  });
});
