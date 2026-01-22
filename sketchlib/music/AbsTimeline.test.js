import { describe, it, expect } from "vitest";
import { Rational } from "../Rational.js";
import { Gap, Parallel, Sequential } from "./Timeline.js";
import {
  AbsGap,
  AbsInterval,
  AbsParallel,
  AbsSequential,
  AbsTimelineOps,
} from "./AbsTimeline.js";

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
});
