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

  describe("flatten", () => {
    it("with AbsGap is identity", () => {
      const gap = new AbsGap(Rational.ZERO, Rational.ONE);

      const result = AbsTimelineOps.flatten(gap);

      expect(result).toBe(gap);
    });

    it("with interval is identity", () => {
      const interval = new AbsInterval(3, Rational.ONE, new Rational(2));

      const result = AbsTimelineOps.flatten(interval);

      expect(result).toBe(interval);
    });

    it("with empty AbsSequential gives empty timeline", () => {
      const seq = new AbsSequential();

      const result = AbsTimelineOps.flatten(seq);

      expect(result).toBe(AbsGap.ZERO);
    });

    it("with flat AbsSequential is identity", () => {
      const seq = new AbsSequential(
        new AbsInterval(1, Rational.ZERO, Rational.ONE),
        new AbsInterval(2, Rational.ONE, new Rational(2)),
      );

      const result = AbsTimelineOps.flatten(seq);

      expect(result).toStrictEqual(seq);
    });

    it("with AbsSequential with single child returns child", () => {
      const interval = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const seq = new AbsSequential(interval);

      const result = AbsTimelineOps.flatten(seq);

      expect(result).toBe(interval);
    });

    it("with AbsSequential containing only zero gaps returns zero gap", () => {
      const seq = new AbsSequential(AbsGap.ZERO, AbsGap.ZERO);

      const result = AbsTimelineOps.flatten(seq);

      expect(result).toBe(Gap.ZERO);
    });

    it("with AbsSequential with zero gaps filters out gaps", () => {
      const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const interval2 = new AbsInterval(1, Rational.ONE, new Rational(2));
      const interval3 = new AbsInterval(1, new Rational(2), new Rational(3));

      const seq = new AbsSequential(
        interval1,
        new AbsGap(Rational.ONE, Rational.ONE),
        interval2,
        interval3,
        new AbsGap(new Rational(3), new Rational(3)),
      );

      const result = AbsTimelineOps.flatten(seq);

      const expected = new AbsSequential(interval1, interval2, interval3);
      expect(result).toStrictEqual(expected);
    });

    it("with nested AbsSequentials returns flattened AbsSequential", () => {
      const interval1 = new AbsInterval(1, new Rational(0), new Rational(1));
      const interval2 = new AbsInterval(2, new Rational(1), new Rational(2));
      const interval3 = new AbsInterval(3, new Rational(2), new Rational(3));
      const interval4 = new AbsInterval(4, new Rational(3), new Rational(4));
      const interval5 = new AbsInterval(5, new Rational(4), new Rational(5));
      const nested = new AbsSequential(
        new AbsSequential(interval1, interval2),
        interval3,
        new AbsSequential(interval4),
        interval5,
      );

      const result = AbsTimelineOps.flatten(nested);

      // Same thing flattened into a single array
      const expected = new AbsSequential(
        interval1,
        interval2,
        interval3,
        interval4,
        interval5,
      );

      expect(result).toStrictEqual(expected);
    });

    it("with empty AbsParallel gives empty timeline", () => {
      const par = new AbsParallel();

      const result = AbsTimelineOps.flatten(par);

      expect(result).toBe(AbsGap.ZERO);
    });

    it("with AbsParallel with single child returns child", () => {
      const interval = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const par = new AbsParallel(interval);

      const result = AbsTimelineOps.flatten(par);

      expect(result).toBe(interval);
    });

    it("flattens nested AbsParallel", () => {
      const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const interval2 = new AbsInterval(2, Rational.ZERO, Rational.ONE);
      const nested = new AbsParallel(
        new AbsParallel(interval1, interval2),
        interval2,
        new AbsParallel(interval1),
        new AbsParallel(interval2, interval2),
        interval1,
      );

      const result = AbsTimelineOps.flatten(nested);

      // Same thing flattened into a single array
      const expected = new AbsParallel(
        interval1,
        interval2,
        interval2,
        interval1,
        interval2,
        interval2,
        interval1,
      );

      expect(result).toStrictEqual(expected);
    });

    it("with Parallel containing only zero gaps returns zero gap", () => {
      const seq = new AbsParallel(AbsGap.ZERO, AbsGap.ZERO);

      const result = AbsTimelineOps.flatten(seq);

      expect(result).toBe(Gap.ZERO);
    });

    it("with Parallel with zero gaps filters out gaps", () => {
      const interval = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const seq = new AbsParallel(
        interval,
        AbsGap.ZERO,
        interval,
        interval,
        AbsGap.ZERO,
      );

      const result = AbsTimelineOps.flatten(seq);

      const expected = new AbsParallel(interval, interval, interval);
      expect(result).toStrictEqual(expected);
    });

    it("flattens sequential within parallel", () => {
      const interval1 = new AbsInterval(1, new Rational(0), new Rational(1));
      const interval2 = new AbsInterval(2, new Rational(1), new Rational(2));
      const interval3 = new AbsInterval(3, new Rational(2), new Rational(3));
      const interval4 = new AbsInterval(4, new Rational(3), new Rational(4));
      const nested = new AbsParallel(
        new AbsSequential(
          interval1,
          new AbsSequential(interval2, interval3),
          interval4,
        ),
        interval1,
      );

      const result = AbsTimelineOps.flatten(nested);

      const expected = new AbsParallel(
        new AbsSequential(interval1, interval2, interval3, interval4),
        interval1,
      );
      expect(result).toStrictEqual(expected);
    });

    it("flattens parallel within sequential", () => {
      const nested = new AbsSequential(
        new AbsParallel(
          new AbsInterval(1, Rational.ZERO, Rational.ONE),
          new AbsParallel(
            new AbsInterval(2, Rational.ZERO, new Rational(1, 2)),
            new AbsInterval(3, Rational.ZERO, new Rational(3, 4)),
          ),
          new AbsInterval(4, Rational.ZERO, Rational.ONE),
        ),
        new AbsInterval(5, Rational.ONE, new Rational(2)),
      );

      const result = AbsTimelineOps.flatten(nested);

      const expected = new AbsSequential(
        new AbsParallel(
          new AbsInterval(1, Rational.ZERO, Rational.ONE),
          new AbsInterval(2, Rational.ZERO, new Rational(1, 2)),
          new AbsInterval(3, Rational.ZERO, new Rational(3, 4)),
          new AbsInterval(4, Rational.ZERO, Rational.ONE),
        ),
        new AbsInterval(5, Rational.ONE, new Rational(2)),
      );
      expect(result).toStrictEqual(expected);
    });

    it("flattens sequential across redundant parallel", () => {
      const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const interval2 = new AbsInterval(2, Rational.ONE, new Rational(2));
      const interval3 = new AbsInterval(3, new Rational(2), new Rational(3));
      const interval4 = new AbsInterval(4, new Rational(3), new Rational(4));
      const interval5 = new AbsInterval(5, new Rational(4), new Rational(5));

      const nested = new AbsSequential(
        interval1,
        // The parallel is redundant, but puts a layer between the
        // sequentials
        new AbsParallel(new AbsSequential(interval2, interval3)),
        new AbsSequential(interval4, interval5),
      );

      const result = AbsTimelineOps.flatten(nested);

      const expected = new AbsSequential(
        interval1,
        interval2,
        interval3,
        interval4,
        interval5,
      );
      expect(result).toStrictEqual(expected);
    });

    it("flattens parallel over redundant sequential", () => {
      const interval1 = new AbsInterval(1, Rational.ZERO, Rational.ONE);
      const interval2 = new AbsInterval(2, Rational.ZERO, new Rational(2));

      const nested = new AbsParallel(
        interval1,
        new AbsSequential(new AbsParallel(interval2, interval2)),
        new AbsParallel(interval1, interval1),
      );

      const result = AbsTimelineOps.flatten(nested);

      const expected = new AbsParallel(
        interval1,
        interval2,
        interval2,
        interval1,
        interval1,
      );
      expect(result).toStrictEqual(expected);
    });

    it("flattens complex empty timeline to zero gap", () => {
      const whole_lot_of_nothing = new AbsSequential(
        new AbsSequential(),
        new AbsParallel(new AbsSequential(), new AbsSequential(AbsGap.ZERO)),
        AbsGap.ZERO,
        new AbsSequential(new AbsSequential()),
        new AbsParallel(new AbsSequential(), AbsGap.ZERO),
        AbsGap.ZERO,
      );

      const result = AbsTimelineOps.flatten(whole_lot_of_nothing);

      expect(result).toBe(AbsGap.ZERO);
    });
  });
});
